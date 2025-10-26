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
  const [outputDialogOpen, setOutputDialogOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(false);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [caseName, setCaseName] = useState("");
  const [caseDescription, setCaseDescription] = useState("");
  const videoPlayerRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [organization]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resultList = await pb.collection("Cases").getFullList({
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
      const videoRecords = await pb.collection("CctvFootage").getList(1, 50, {
        filter: `organisation = "${organization.id}"`,
        sort: "-created",
      });
      setUploadedVideos(videoRecords.items);

      // Fetch reference photos - match SearchItem exactly
      const photoRecords = await pb
        .collection("ReferencePhoto")
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

  const simulateProcessing = async () => {
    if (!selectedVideo || !selectedPhoto) {
      toast.error("Please select both a video and a reference photo");
      return;
    }

    setProcessing(true);
    setProcessingProgress(0);
    setProcessingStage("Initializing analysis...");

    // Create case record first
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

      const caseRecord = await pb.collection("Cases").create(caseData);
      toast.success("Case created successfully");

      // Refresh cases list
      await fetchData();
    } catch (error) {
      toast.error("Failed to create case");
    }

    const stages = [
      { stage: "Extracting video frames...", duration: 2000 },
      { stage: "Detecting faces in video...", duration: 3000 },
      { stage: "Analyzing reference photo...", duration: 2000 },
      { stage: "Matching faces...", duration: 4000 },
      { stage: "Generating output video...", duration: 3000 },
      { stage: "Finalizing results...", duration: 1000 },
    ];

    let totalProgress = 0;
    const totalDuration = stages.reduce(
      (sum, stage) => sum + stage.duration,
      0
    );

    for (let i = 0; i < stages.length; i++) {
      const { stage, duration } = stages[i];
      setProcessingStage(stage);

      // Simulate progress for this stage
      const stageProgress = duration / totalDuration;
      const startProgress = totalProgress;

      await new Promise((resolve) => {
        const interval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          setProcessingProgress(startProgress + progress * stageProgress);

          if (progress >= 1) {
            clearInterval(interval);
            resolve();
          }
        }, 50);

        const startTime = Date.now();
      });

      totalProgress += stageProgress;
    }

    // Create fake output video
    const fakeOutputVideo = {
      id: "fake-output-" + Date.now(),
      video: "analysis_result.mp4",
      thumbnail: selectedVideo.thumbnail,
      created: new Date().toISOString(),
      matches: Math.floor(Math.random() * 5) + 1,
      confidence: (Math.random() * 0.3 + 0.7).toFixed(2),
    };

    setOutputVideo(fakeOutputVideo);
    setProcessing(false);
    setProcessingProgress(100);
    setProcessingStage("Analysis complete!");

    toast.success(
      `Analysis complete! Found ${fakeOutputVideo.matches} matches with ${(
        fakeOutputVideo.confidence * 100
      ).toFixed(1)}% confidence`
    );
  };

  const handleViewOutput = () => {
    setOutputDialogOpen(true);
  };

  const handleCloseOutput = () => {
    setOutputDialogOpen(false);
    if (videoPlayerRef.current) {
      videoPlayerRef.current.pause();
    }
  };

  const resetCase = () => {
    setSelectedVideo(null);
    setSelectedPhoto(null);
    setOutputVideo(null);
    setProcessingProgress(0);
    setProcessingStage("");
    setShowCreateForm(false);
    setCaseName("");
    setCaseDescription("");
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
        await pb.collection("Cases").delete(caseId);
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
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
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
                    <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
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
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Video className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Photo Thumbnail */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
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
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Camera className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Case Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900">
                          {caseItem.name || `Case #${caseItem.id.slice(-8)}`}
                        </h4>
                      </div>

                      {caseItem.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {caseItem.description}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
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

                      <div className="flex items-center text-xs text-gray-500 mt-2">
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
                      <Button variant="outline" size="sm">
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
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <PlayCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
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
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
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
                              <PlayCircle className="h-8 w-8 text-white drop-shadow-lg" />
                            </div>
                          </>
                        )}
                        {selectedVideo?.id === video.id && (
                          <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {new Date(video.created).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="mt-2">
                        <h4 className="text-sm font-medium truncate text-gray-900">
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
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
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
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                        <img
                          src={pb.getFileUrl(photo, photo.photo)}
                          alt="Reference"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                        {selectedPhoto?.id === photo.id && (
                          <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-1">
                            <CheckCircle className="h-3 w-3" />
                          </div>
                        )}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <div className="bg-white/90 rounded-full p-2">
                            <Image className="h-4 w-4 text-gray-700" />
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
                onClick={simulateProcessing}
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
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${processingProgress}%` }}
                      />
                    </div>
                  </div>
                </Card>
              )}

              {/* Output Section */}
              {outputVideo && (
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-green-600">
                        Analysis Complete!
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Found {outputVideo.matches} matches with{" "}
                        {(outputVideo.confidence * 100).toFixed(1)}% confidence
                      </p>
                    </div>
                    <Button onClick={handleViewOutput} variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Results
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {outputVideo.matches}
                      </div>
                      <div className="text-sm text-blue-600">Matches Found</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {(outputVideo.confidence * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-green-600">Confidence</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        HD
                      </div>
                      <div className="text-sm text-purple-600">Quality</div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Output Video Dialog */}
      <Dialog open={outputDialogOpen} onOpenChange={handleCloseOutput}>
        <DialogContent className="max-w-4xl w-[90vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Analysis Results</span>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </DialogTitle>
            <DialogDescription>
              Video with highlighted face matches and analysis results
            </DialogDescription>
          </DialogHeader>
          {outputVideo && (
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-md overflow-hidden">
                <video
                  ref={videoPlayerRef}
                  className="w-full h-full"
                  controls
                  autoPlay
                >
                  <source
                    src={pb.getFileUrl(selectedVideo, selectedVideo.video)}
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Analysis Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Matches:</span>
                      <span className="font-medium">{outputVideo.matches}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confidence:</span>
                      <span className="font-medium">
                        {(outputVideo.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing Time:</span>
                      <span className="font-medium">15.3s</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Reference Photo</h4>
                  <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    {selectedPhoto && (
                      <img
                        src={pb.getFileUrl(selectedPhoto, selectedPhoto.photo)}
                        alt="Reference"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CasesItem;
