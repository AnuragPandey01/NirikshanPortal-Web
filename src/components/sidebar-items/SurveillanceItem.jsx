import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import pb from "@/lib/pb";
import useAuthStore from "@/store/authStore";

const SurveillanceItem = () => {
  const { organization } = useAuthStore();
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.includes('video/')) {
      setError('Please upload a valid video file');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('organisation', organization?.id);

      const record = await pb.collection('CctvFootage').create(formData);
      
      setUploadedVideos(prev => [...prev, record]);
      setSuccess(true);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload video');
    } finally {
      setUploading(false);
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

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Video uploaded successfully
          </div>
        )}

        <div className="space-y-4">
          {uploadedVideos.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-muted-foreground">No videos uploaded yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Upload CCTV footage to begin analysis
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {uploadedVideos.map((video) => (
                <Card key={video.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {video.video || 'Untitled Video'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Uploaded {new Date(video.created).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SurveillanceItem;
