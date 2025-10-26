import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Camera, 
  Upload, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Clock,
  PlayCircle,
  Trash2,
  X 
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

const SurveillanceItem = () => {
  const { organization } = useAuthStore();
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const fileInputRef = useRef(null);
  const videoPlayerRef = useRef(null);

  useEffect(() => {
    fetchVideos();
  }, [organization]);

  const fetchVideos = async () => {
    if (!organization?.id) return;
    
    try {
      const records = await pb.collection('CctvFootage')
        .getList(1, 50, {
          filter: `organisation = "${organization.id}"`,
          sort: '-created'
        });
      setUploadedVideos(records.items);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const generateThumbnail = async (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        video.currentTime = 1; // Capture frame at 1 second
      };
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(video.src);
          resolve(new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.7);
      };
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.includes('video/')) {
      toast.error('Please upload a valid video file');
      return;
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast.error('Video size should be less than 100MB');
      return;
    }

    const uploadPromise = async () => {
      setUploading(true);
      try {
        // Generate thumbnail from the first frame
        const thumbnail = await generateThumbnail(file);
        
        const formData = new FormData();
        formData.append('video', file);
        formData.append('thumbnail', thumbnail);
        formData.append('organisation', organization?.id);

          const record = await pb.collection('CctvFootage').create(formData);
        await fetchVideos(); // Refresh the video list
        return 'Video uploaded successfully';
      } catch (error) {
        console.error('Upload error:', error);
        throw new Error(error.message || 'Failed to upload video');
      } finally {
        setUploading(false);
      }
    };

    toast.promise(uploadPromise(), {
      loading: 'Uploading video...',
      success: (message) => message,
      error: (err) => err.message
    });
  };

  const handleDelete = async (videoId) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    const deletePromise = async () => {
      try {
        await pb.collection('CctvFootage').delete(videoId);
        await fetchVideos(); // Refresh the list after deletion
        return 'Video deleted successfully';
      } catch (error) {
        console.error('Delete error:', error);
        throw new Error('Failed to delete video');
      }
    };

    toast.promise(deletePromise(), {
      loading: 'Deleting video...',
      success: (message) => message,
      error: (err) => err.message
    });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setVideoDialogOpen(true);
  };

  const handleCloseVideo = () => {
    setSelectedVideo(null);
    setVideoDialogOpen(false);
    if (videoPlayerRef.current) {
      videoPlayerRef.current.pause();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold">Surveillance Videos</h3>
            <p className="text-sm text-muted-foreground">
              Upload and manage CCTV footage for analysis
            </p>
          </div>
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Upload Video
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="video/*"
            onChange={handleFileSelect}
          />
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground mt-4">Loading videos...</p>
            </div>
          ) : uploadedVideos.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-muted-foreground">No videos uploaded yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Upload CCTV footage to begin analysis
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedVideos.map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  <div 
                    className="aspect-video bg-gray-100 relative group cursor-pointer"
                    onClick={() => handleVideoClick(video)}
                  >
                    {video.video && (
                      <>
                        <video 
                          className="w-full h-full object-cover"
                          poster={video.thumbnail ? pb.getFileUrl(video, video.thumbnail) : undefined}
                        >
                          <source src={pb.getFileUrl(video, video.video)} type="video/mp4" />
                        </video>
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <PlayCircle className="h-12 w-12 text-white" />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium truncate">
                        {video.video || 'Untitled Video'}
                      </h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(video.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground space-x-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{new Date(video.created).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <PlayCircle className="h-4 w-4 mr-1" />
                        <span>Ready for Analysis</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Video Player Dialog */}
      <Dialog open={videoDialogOpen} onOpenChange={handleCloseVideo}>
        <DialogContent className="max-w-4xl w-[90vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedVideo?.video || 'Video Player'}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="aspect-video bg-black rounded-md overflow-hidden">
              <video
                ref={videoPlayerRef}
                className="w-full h-full"
                controls
                autoPlay
              >
                <source src={pb.getFileUrl(selectedVideo, selectedVideo.video)} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SurveillanceItem;
