import { useState, useRef, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import pb from "@/lib/pb";
import { PB_COLLECTIONS } from "@/lib/pbCollections";
import useAuthStore from "@/store/authStore";

const CasesItem = () => {
  const { organization } = useAuthStore();
  const [cases, setCases] = useState([]);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [referencePhotos, setReferencePhotos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState("");
  const [outputVideo, setOutputVideo] = useState(null);
  const [lastAnalyzedCase, setLastAnalyzedCase] = useState(null);
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [resultsDialogCase, setResultsDialogCase] = useState(null);
  const [resultsDialogMatches, setResultsDialogMatches] = useState([]);
  const [resultsDialogLoading, setResultsDialogLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(false);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [caseName, setCaseName] = useState("");
  const [caseDescription, setCaseDescription] = useState("");
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState({
    currentFrame: 0,
    totalFrames: 0,
    matchesFound: 0,
  });
  const videoPlayerRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [organization]);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resultList = await pb.collection(PB_COLLECTIONS.CASES).getFullList({
        expand: "video,photo",
      });
      console.log("cases", resultList);
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
    } catch (error) {
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

    setProcessing(true);
    setProcessingProgress(0);
    setProcessingStage("Initializing analysis...");
    setMatches([]);
    setStats({ currentFrame: 0, totalFrames: 0, matchesFound: 0 });

    // Create case record first
    let caseRecord;
    try {
      const caseData = {
        name: caseName,
        description: caseDescription,
        video: selectedVideo.id,
        photo: selectedPhoto.id,
        organisation: organization?.id,
        status: "processing",
        created_at: new Date().toISOString(),
      };

      caseRecord = await pb.collection(PB_COLLECTIONS.CASES).create(caseData);
      toast.success("Case created successfully");
      await fetchData();
    } catch (error) {
      toast.error("Failed to create case");
      setProcessing(false);
      return;
    }

    // Get file URLs from PocketBase
    const videoUrl = pb.getFileUrl(selectedVideo, selectedVideo.video);
    const photoUrl = pb.getFileUrl(selectedPhoto, selectedPhoto.photo);

    // Connect to WebSocket
    const wsUrl = "ws://localhost:8000/ws/detect-faces";
    const ws = new WebSocket(wsUrl);

    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to WebSocket");
      setProcessingStage("✓ Connected to server");

      // Send parameters to WebSocket
      ws.send(
        JSON.stringify({
          video_url: videoUrl,
          photo_url: photoUrl,
          case_id: caseRecord.id,
          model_name: "Facenet512",
          detector_backend: "mtcnn",
          threshold: 0.3,
          frame_skip: 60,
          refine_around_matches: true,
          progress_every_n_frames: 24,
          motion_filter: true,
        })
      );
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        const msgType = data.type;

        if (msgType === "status") {
          setProcessingStage(`📋 ${data.message}`);
        } else if (msgType === "video_info") {
          setStats((prev) => ({
            ...prev,
            totalFrames: data.total_frames,
          }));
          setProcessingStage(`🎥 Processing ${data.total_frames} frames...`);
        } else if (msgType === "progress") {
          const percentage = data.percentage;
          setProcessingProgress(percentage);
          setStats({
            currentFrame: data.current_frame,
            totalFrames: data.total_frames,
            matchesFound: data.matches_found,
          });
          setProcessingStage(
            `Processing: ${data.current_frame}/${data.total_frames} frames`
          );
        } else if (msgType === "match") {
          setMatches((prev) => [
            ...prev,
            {
              frameNumber: data.frame_number,
              timestamp: data.timestamp,
              similarity: data.similarity_score,
              frameBase64: data.frame_base64,
            },
          ]);
        } else if (msgType === "complete") {
          setProcessingProgress(100);
          setProcessingStage("✅ Analysis complete!");

          // Update case record with results
          pb.collection(PB_COLLECTIONS.CASES)
            .update(caseRecord.id, {
              status: "completed",
              matches_count: data.matches_count,
              processed_frames: data.processed_frames,
            })
            .catch((err) => console.error("Error updating case:", err));

          setOutputVideo({
            matches: data.matches_count,
            confidence: data.matches_count > 0 ? 0.8 : 0,
            processedFrames: data.processed_frames,
          });
          setLastAnalyzedCase({
            ...caseRecord,
            matches_count: data.matches_count,
            processed_frames: data.processed_frames,
            expand: {
              video: selectedVideo,
              photo: selectedPhoto,
            },
          });

          toast.success(
            `Analysis complete! Found ${data.matches_count} matches in ${data.processed_frames} processed frames.`
          );
          setProcessing(false);
          await fetchData();
        } else if (msgType === "error") {
          setProcessingStage(`❌ Error: ${data.detail}`);
          toast.error(`Analysis failed: ${data.detail}`);

          // Update case record with error
          pb.collection(PB_COLLECTIONS.CASES)
            .update(caseRecord.id, { status: "failed" })
            .catch((err) => console.error("Error updating case:", err));

          setProcessing(false);
          await fetchData();
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setProcessingStage(
        "❌ Connection error. Make sure the server is running."
      );
      toast.error("Failed to connect to analysis server");
      setProcessing(false);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      if (processing) {
        setProcessingStage("Connection closed unexpectedly");
        setProcessing(false);
      }
    };
  };

  const openResultsForCase = async (caseRow) => {
    if (!caseRow?.id) {
      toast.error("Missing case information");
      return;
    }
    setResultsDialogCase(caseRow);
    setResultsDialogOpen(true);
    setResultsDialogLoading(true);
    setResultsDialogMatches([]);
    try {
      const rows = await pb.collection(PB_COLLECTIONS.CASE_MATCH).getFullList({
        filter: `case="${caseRow.id}"`,
        sort: "frame_number",
      });
      setResultsDialogMatches(rows);
    } catch (e) {
      console.error(e);
      toast.error("Could not load saved results");
    } finally {
      setResultsDialogLoading(false);
    }
  };

  const handleViewOutput = () => {
    if (lastAnalyzedCase) openResultsForCase(lastAnalyzedCase);
  };

  const handleCloseResultsDialog = (open) => {
    if (open) return;
    setResultsDialogOpen(false);
    setResultsDialogCase(null);
    setResultsDialogMatches([]);
    if (videoPlayerRef.current) {
      videoPlayerRef.current.pause();
    }
  };

  const resetCase = () => {
    // Close WebSocket if open
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setSelectedVideo(null);
    setSelectedPhoto(null);
    setOutputVideo(null);
    setLastAnalyzedCase(null);
    setProcessing(false);
    setProcessingProgress(0);
    setProcessingStage("");
    setShowCreateForm(false);
    setCaseName("");
    setCaseDescription("");
    setMatches([]);
    setStats({ currentFrame: 0, totalFrames: 0, matchesFound: 0 });
    toast.success("Case reset successfully");
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
                    {caseItem.status === "processing" && (
                      <Button variant="outline" size="sm" disabled>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Processing
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
            <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
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
                  processing ||
                  !caseName.trim()
                }
                className="w-full"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Start Analysis
                  </>
                )}
              </Button>

              {processing && (
                <Card className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {processingStage}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(processingProgress)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${processingProgress}%` }}
                      />
                    </div>

                    {/* Real-time Stats */}
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="text-center rounded-lg border border-border bg-chart-1/10 p-2 dark:bg-chart-1/15">
                        <div className="text-lg font-bold tabular-nums text-chart-1">
                          {stats.currentFrame}
                        </div>
                        <div className="text-xs text-chart-1">
                          Current Frame
                        </div>
                      </div>
                      <div className="text-center rounded-lg border border-border bg-chart-2/10 p-2 dark:bg-chart-2/15">
                        <div className="text-lg font-bold tabular-nums text-chart-2">
                          {stats.totalFrames}
                        </div>
                        <div className="text-xs text-chart-2">
                          Total Frames
                        </div>
                      </div>
                      <div className="text-center rounded-lg border border-border bg-chart-3/10 p-2 dark:bg-chart-3/15">
                        <div className="text-lg font-bold tabular-nums text-chart-3">
                          {stats.matchesFound}
                        </div>
                        <div className="text-xs text-chart-3">Matches</div>
                      </div>
                    </div>

                    {/* Show Matches if any */}
                    {matches.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm font-medium mb-2">
                          Recent Matches:
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {matches.slice(-5).map((match, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 rounded-md border border-border bg-muted/50 p-2 text-xs"
                            >
                              <img
                                src={`data:image/jpeg;base64,${match.frameBase64}`}
                                alt="Match"
                                className="w-12 h-9 object-cover rounded"
                              />
                              <div className="flex-1">
                                <div className="font-medium">
                                  Frame {match.frameNumber}
                                </div>
                                <div className="text-muted-foreground">
                                  {match.timestamp}s •{" "}
                                  {(match.similarity * 100).toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Output Section */}
              {outputVideo && (
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-chart-2">
                        Analysis Complete!
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Found {outputVideo.matches} matches in{" "}
                        {outputVideo.processedFrames} processed frames
                      </p>
                    </div>
                    <Button onClick={handleViewOutput} variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Results
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="rounded-lg border border-border bg-chart-1/10 p-3 dark:bg-chart-1/15">
                      <div className="text-2xl font-bold tabular-nums text-chart-1">
                        {outputVideo.matches}
                      </div>
                      <div className="text-sm text-chart-1">Matches Found</div>
                    </div>
                    <div className="rounded-lg border border-border bg-chart-2/10 p-3 dark:bg-chart-2/15">
                      <div className="text-2xl font-bold tabular-nums text-chart-2">
                        {outputVideo.processedFrames}
                      </div>
                      <div className="text-sm text-chart-2">
                        Processed Frames
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-chart-3/10 p-3 dark:bg-chart-3/15">
                      <div className="text-2xl font-bold tabular-nums text-chart-3">
                        {(outputVideo.confidence * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-chart-3">Confidence</div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Output Video Dialog */}
      <Dialog open={resultsDialogOpen} onOpenChange={handleCloseResultsDialog}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                {resultsDialogCase?.name?.trim()
                  ? resultsDialogCase.name
                  : "Analysis results"}
              </span>
            </DialogTitle>
            <DialogDescription>
              Source video, reference photo, and frames saved for this case
            </DialogDescription>
          </DialogHeader>
          {resultsDialogCase && (
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-md overflow-hidden">
                <video
                  ref={videoPlayerRef}
                  className="w-full h-full"
                  controls
                  autoPlay
                >
                  {resultsDialogCase.expand?.video?.video ? (
                    <source
                      src={pb.getFileUrl(
                        resultsDialogCase.expand.video,
                        resultsDialogCase.expand.video.video
                      )}
                      type="video/mp4"
                    />
                  ) : null}
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-muted/40 p-4">
                  <h4 className="font-semibold mb-2">Analysis Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Matches:</span>
                      <span className="font-medium">
                        {resultsDialogCase.matches_count ?? resultsDialogMatches.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processed Frames:</span>
                      <span className="font-medium">
                        {resultsDialogCase.processed_frames ?? "—"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/40 p-4">
                  <h4 className="font-semibold mb-2">Reference Photo</h4>
                  <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                    {resultsDialogCase.expand?.photo?.photo ? (
                      <img
                        src={pb.getFileUrl(
                          resultsDialogCase.expand.photo,
                          resultsDialogCase.expand.photo.photo
                        )}
                        alt="Reference"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        No reference image
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {resultsDialogLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <p className="text-sm">Loading saved matches…</p>
                </div>
              ) : resultsDialogMatches.length > 0 ? (
                <div className="rounded-lg border border-border bg-muted/40 p-4">
                  <h4 className="font-semibold mb-3">Detected Matches</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {resultsDialogMatches.map((row) => (
                      <div
                        key={row.id}
                        className="rounded-lg border border-border bg-card p-2"
                      >
                        {row.thumbnail ? (
                          <img
                            src={pb.getFileUrl(row, row.thumbnail)}
                            alt={`Frame ${row.frame_number}`}
                            className="w-full h-24 object-cover rounded mb-2"
                          />
                        ) : (
                          <div className="w-full h-24 rounded mb-2 bg-muted flex items-center justify-center text-xs text-muted-foreground">
                            No thumbnail
                          </div>
                        )}
                        <div className="text-xs">
                          <div className="font-medium">
                            Frame {row.frame_number}
                          </div>
                          <div className="text-muted-foreground">
                            {row.timestamp_sec}s
                          </div>
                          <div className="font-semibold text-primary">
                            {typeof row.similarity_score === "number"
                              ? `${(row.similarity_score * 100).toFixed(1)}% similarity`
                              : "—"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No saved frame matches for this case yet.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CasesItem;
