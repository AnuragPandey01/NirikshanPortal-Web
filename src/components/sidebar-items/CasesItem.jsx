import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  FileText,
  PlayCircle,
  Image,
  Loader2,
  CheckCircle,
  Clock,
  Trash2,
  Search,
  Download,
  Eye,
  Plus,
  Calendar,
  Video,
  Camera,
  X,
} from "lucide-react";
import pb from "@/lib/pb";
import { PB_COLLECTIONS } from "@/lib/pbCollections";
import { enqueueAnalysisJob } from "@/lib/analysisApi";
import useAuthStore from "@/store/authStore";

const DEFAULT_ANALYSIS_PARAMS = {
  model_name: "Facenet512",
  detector_backend: "mtcnn",
  threshold: 0.3,
  frame_skip: 60,
  refine_around_matches: true,
  progress_every_n_frames: 24,
  motion_filter: true,
};

const CasesItem = () => {
  const { organization } = useAuthStore();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [referencePhotos, setReferencePhotos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [enqueueSubmitting, setEnqueueSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(false);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [caseName, setCaseName] = useState("");
  const [caseDescription, setCaseDescription] = useState("");

  useEffect(() => {
    fetchData();
  }, [organization]);

  useEffect(() => {
    if (!organization?.id) return undefined;

    let cancelled = false;
    let unsubscribe = null;

    pb.collection(PB_COLLECTIONS.CASES)
      .subscribe("*", (e) => {
        if (cancelled) return;
        const r = e.record;
        if (r.organisation !== organization.id) return;

        setCases((prev) => {
          if (e.action === "delete") {
            return prev.filter((c) => c.id !== r.id);
          }
          const idx = prev.findIndex((c) => c.id === r.id);
          const prevRow = idx >= 0 ? prev[idx] : null;
          const merged =
            prevRow?.expand &&
            !(r.expand?.video || r.expand?.photo) &&
            (prevRow.expand?.video || prevRow.expand?.photo)
              ? { ...r, expand: prevRow.expand }
              : r;
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = merged;
            return next;
          }
          return [...prev, merged];
        });
      })
      .then((unsub) => {
        if (cancelled) {
          if (typeof unsub === "function") unsub();
        } else {
          unsubscribe = unsub;
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [organization?.id]);

  const fetchData = async () => {
    if (!organization?.id) {
      setCases([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const resultList = await pb.collection(PB_COLLECTIONS.CASES).getFullList({
        expand: "video,photo",
        filter: `organisation = "${organization.id}"`,
        sort: "-created",
      });
      setCases(resultList);
    } catch (error) {
      console.error("Error fetching cases:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideosAndPhotos = async () => {
    if (!organization?.id) return;

    setVideosLoading(true);
    setPhotosLoading(true);

    try {
      // Fetch videos - match SurveillanceItem exactly
      const videoRecords = await pb
        .collection(PB_COLLECTIONS.CCTV_FOOTAGE)
        .getList(1, 50, {
          filter: `organisation = "${organization.id}"`,
          sort: "-created",
        });
      setUploadedVideos(videoRecords.items);

      // Fetch reference photos - match SearchItem exactly
      const photoRecords = await pb
        .collection(PB_COLLECTIONS.REFERENCE_PHOTO)
        .getList(1, 50, {
          filter: `organisation = "${organization.id}"`,
          sort: "-created",
        });
      setReferencePhotos(photoRecords.items || []);
    } catch {
      toast.error("Failed to load videos and photos");
    } finally {
      setVideosLoading(false);
      setPhotosLoading(false);
    }
  };

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
    toast.success(`Selected video: ${video.video || "Untitled"}`);
  };

  const handlePhotoSelect = (photo) => {
    setSelectedPhoto(photo);
    toast.success("Reference photo selected");
  };

  const startProcessing = async () => {
    if (!selectedVideo || !selectedPhoto) {
      toast.error("Please select both a video and a reference photo");
      return;
    }
    if (!pb.authStore.token) {
      toast.error("You must be signed in to run analysis");
      return;
    }

    setEnqueueSubmitting(true);
    try {
      const caseRecord = await pb.collection(PB_COLLECTIONS.CASES).create({
        name: caseName,
        description: caseDescription,
        video: selectedVideo.id,
        photo: selectedPhoto.id,
        organisation: organization?.id,
        status: "queued",
      });

      await enqueueAnalysisJob(pb.authStore.token, {
        case_id: caseRecord.id,
        ...DEFAULT_ANALYSIS_PARAMS,
      });

      toast.success(
        "Analysis queued. Progress is saved on the case — safe to leave this page."
      );
      await fetchData();
      setShowCreateForm(false);
      setSelectedVideo(null);
      setSelectedPhoto(null);
      setCaseName("");
      setCaseDescription("");
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to queue analysis");
    } finally {
      setEnqueueSubmitting(false);
    }
  };

  const retryEnqueue = async (caseRow) => {
    if (!pb.authStore.token) {
      toast.error("You must be signed in");
      return;
    }
    try {
      await enqueueAnalysisJob(pb.authStore.token, {
        case_id: caseRow.id,
        ...DEFAULT_ANALYSIS_PARAMS,
      });
      toast.success("Analysis re-queued");
      await fetchData();
    } catch (error) {
      toast.error(error?.message || "Failed to re-queue");
    }
  };

  const openResultsForCase = (caseRow) => {
    if (!caseRow?.id) {
      toast.error("Missing case information");
      return;
    }
    navigate(`cases/${caseRow.id}/results`);
  };

  const handleCreateCase = async () => {
    setShowCreateForm(true);
    await fetchVideosAndPhotos();
  };

  const handleDeleteCase = async (caseId) => {
    if (!confirm("Are you sure you want to delete this case?")) return;

    const deletePromise = async () => {
      try {
        await pb.collection(PB_COLLECTIONS.CASES).delete(caseId);
        await fetchData(); // Refresh the list after deletion
        return "Case deleted successfully";
      } catch (error) {
        console.error("Delete error:", error);
        throw new Error("Failed to delete case");
      }
    };

    toast.promise(deletePromise(), {
      loading: "Deleting case...",
      success: (message) => message,
      error: (err) => err.message,
    });
  };

  return (
    <div className="space-y-6">
      {/* Cases List */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold">Active Cases</h3>
            <p className="text-sm text-muted-foreground">
              Manage face recognition analysis cases
            </p>
          </div>
          <Button onClick={handleCreateCase}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Case
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground mt-4">Loading cases...</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/60 mb-4" />
            <p className="text-muted-foreground">No cases found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Create your first case to start face recognition analysis
            </p>
            <Button onClick={handleCreateCase} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create First Case
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map((caseItem) => (
              <Card
                key={caseItem.id}
                className="p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Video Thumbnail */}
                    <div className="w-24 h-16 bg-muted rounded-lg overflow-hidden shrink-0">
                      {caseItem.expand?.video?.video ? (
                        <video
                          className="w-full h-full object-cover"
                          poster={
                            caseItem.expand.video.thumbnail
                              ? pb.getFileUrl(
                                  caseItem.expand.video,
                                  caseItem.expand.video.thumbnail
                                )
                              : undefined
                          }
                        >
                          <source
                            src={pb.getFileUrl(
                              caseItem.expand.video,
                              caseItem.expand.video.video
                            )}
                            type="video/mp4"
                          />
                        </video>
                      ) : (
                        <div className="w-full h-full bg-muted/80 flex items-center justify-center">
                          <Video className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Photo Thumbnail */}
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden shrink-0">
                      {caseItem.expand?.photo?.photo ? (
                        <img
                          src={pb.getFileUrl(
                            caseItem.expand.photo,
                            caseItem.expand.photo.photo
                          )}
                          alt="Reference"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted/80 flex items-center justify-center">
                          <Camera className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Case Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-foreground">
                          {caseItem.name || `Case #${caseItem.id.slice(-8)}`}
                        </h4>
                      </div>

                      {caseItem.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {caseItem.description}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                          <div className="flex items-center mb-1">
                            <Video className="h-4 w-4 mr-2" />
                            <span className="font-medium">Video:</span>
                          </div>
                          <p className="truncate">
                            {caseItem.expand?.video?.video || "Unknown Video"}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center mb-1">
                            <Camera className="h-4 w-4 mr-2" />
                            <span className="font-medium">Reference:</span>
                          </div>
                          <p className="truncate">
                            {caseItem.expand?.photo?.photo || "Unknown Photo"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center text-xs text-muted-foreground mt-2">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>
                          Created{" "}
                          {new Date(caseItem.created).toLocaleDateString()}
                        </span>
                      </div>

                      {(caseItem.status === "queued" ||
                        caseItem.status === "processing") &&
                        caseItem.analysis_stage && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {caseItem.analysis_stage}
                          </p>
                        )}
                      {caseItem.status === "failed" &&
                        caseItem.analysis_error && (
                          <p className="text-xs text-destructive mt-2 line-clamp-3">
                            {caseItem.analysis_error}
                          </p>
                        )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    {caseItem.status === "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openResultsForCase(caseItem)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Results
                      </Button>
                    )}
                    {caseItem.status === "queued" && (
                      <Button variant="outline" size="sm" disabled>
                        <Clock className="h-4 w-4 mr-1" />
                        In queue
                      </Button>
                    )}
                    {caseItem.status === "processing" && (
                      <Button variant="outline" size="sm" disabled>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Processing
                      </Button>
                    )}
                    {caseItem.status === "failed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => retryEnqueue(caseItem)}
                      >
                        <Search className="h-4 w-4 mr-1" />
                        Retry
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDeleteCase(caseItem.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Create Case Form */}
      {showCreateForm && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold">Create New Case</h3>
              <p className="text-sm text-muted-foreground">
                Select a video and reference photo to create a new face
                recognition analysis case
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => {
                setShowCreateForm(false);
                setSelectedVideo(null);
                setSelectedPhoto(null);
                setCaseName("");
                setCaseDescription("");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Case Name and Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="caseName"
                  className="text-sm font-medium mb-2 block"
                >
                  Case Name *
                </Label>
                <Input
                  id="caseName"
                  placeholder="Enter case name"
                  value={caseName}
                  onChange={(e) => setCaseName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label
                  htmlFor="caseDescription"
                  className="text-sm font-medium mb-2 block"
                >
                  Description (Optional)
                </Label>
                <Input
                  id="caseDescription"
                  placeholder="Enter case description"
                  value={caseDescription}
                  onChange={(e) => setCaseDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Video Selection */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Select Video
              </Label>
              {videosLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground mt-4">
                    Loading videos...
                  </p>
                </div>
              ) : uploadedVideos.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                  <PlayCircle className="h-12 w-12 mx-auto text-muted-foreground/60 mb-4" />
                  <p className="text-muted-foreground">No videos available</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Upload videos in the Surveillance section first
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {uploadedVideos.map((video) => (
                    <div
                      key={video.id}
                      className={`group cursor-pointer transition-all duration-200 ${
                        selectedVideo?.id === video.id
                          ? "bg-primary/10 shadow-md"
                          : "hover:shadow-lg hover:scale-105"
                      }`}
                      onClick={() => handleVideoSelect(video)}
                    >
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                        {video.video && (
                          <>
                            <video
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              poster={
                                video.thumbnail
                                  ? pb.getFileUrl(video, video.thumbnail)
                                  : undefined
                              }
                            >
                              <source
                                src={pb.getFileUrl(video, video.video)}
                                type="video/mp4"
                              />
                            </video>
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="rounded-full bg-primary/90 p-2 shadow-md ring-2 ring-primary-foreground/20">
                                <PlayCircle className="h-8 w-8 text-primary-foreground" />
                              </div>
                            </div>
                          </>
                        )}
                        {selectedVideo?.id === video.id && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 bg-foreground/80 text-background text-xs px-2 py-1 rounded">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {new Date(video.created).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="mt-2">
                        <h4 className="text-sm font-medium truncate text-foreground">
                          {video.video || "Untitled Video"}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Photo Selection */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Select Reference Photo
              </Label>
              {photosLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground mt-4">
                    Loading photos...
                  </p>
                </div>
              ) : referencePhotos.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                  <Image className="h-12 w-12 mx-auto text-muted-foreground/60 mb-4" />
                  <p className="text-muted-foreground">
                    No reference photos available
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Upload reference photos in the Search section first
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {referencePhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className={`group cursor-pointer transition-all duration-200 ${
                        selectedPhoto?.id === photo.id
                          ? "bg-primary/10 shadow-md"
                          : "hover:shadow-lg hover:scale-105"
                      }`}
                      onClick={() => handlePhotoSelect(photo)}
                    >
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
                        <img
                          src={pb.getFileUrl(photo, photo.photo)}
                          alt="Reference"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-transparent transition-colors duration-200 group-hover:bg-foreground/10" />
                        {selectedPhoto?.id === photo.id && (
                          <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                            <CheckCircle className="h-3 w-3" />
                          </div>
                        )}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <div className="bg-card/90 rounded-full p-2 shadow-sm ring-1 ring-border">
                            <Image className="h-4 w-4 text-foreground" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Processing Section */}
            <div className="space-y-4">
              <Button
                onClick={startProcessing}
                disabled={
                  !selectedVideo ||
                  !selectedPhoto ||
                  enqueueSubmitting ||
                  !caseName.trim()
                }
                className="w-full"
              >
                {enqueueSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Queuing…
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Start Analysis
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Analysis runs on the server in order with other jobs. Watch
                progress under Active Cases — you can refresh or switch accounts
                in the same organisation.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CasesItem;
