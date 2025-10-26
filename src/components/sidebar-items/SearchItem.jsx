import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Upload, Image, Loader2, Trash2, Plus } from "lucide-react";
import pb from "@/lib/pb";
import useAuthStore from "@/store/authStore";
import { toast } from "sonner";

const SearchItem = () => {
  const { organization } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [referencePhotos, setReferencePhotos] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchReferencePhotos();
  }, [organization]);

  const fetchReferencePhotos = async () => {
    if (!organization?.id) return;
    
    try {
      const records = await pb.collection('ReferencePhoto').getList(1, 50, {
        filter: `organisation = "${organization.id}"`,
        sort: '-created'
      });
      
      setReferencePhotos(records.items || []);
    } catch (error) {
      console.error('Error fetching reference photos:', error);
      toast.error('Failed to load reference photos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate each file
    for (const file of files) {
      if (!file.type.includes('image/')) {
        toast.error(`${file.name} is not a valid image file`);
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds 5MB size limit`);
        return;
      }
    }

    setUploading(true);

    try {
      // Upload files one by one with progress tracking
      for (const file of files) {
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('organisation', organization?.id);

        await toast.promise(
          (async () => {
            await pb.collection('ReferencePhoto').create(formData);
            // Fetch updated list after each successful upload
            await fetchReferencePhotos();
            return `${file.name} uploaded successfully`;
          })(),
          {
            loading: `Uploading ${file.name}...`,
            success: (message) => message,
            error: (err) => err.message
          }
        );
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId) => {
    if (!confirm('Are you sure you want to delete this reference photo?')) return;

    const deletePromise = async () => {
      try {
        await pb.collection('ReferencePhoto').delete(photoId);
        await fetchReferencePhotos(); // Refresh the list
        return 'Reference photo deleted successfully';
      } catch (error) {
        console.error('Delete error:', error);
        throw new Error('Failed to delete photo');
      }
    };

    toast.promise(deletePromise(), {
      loading: 'Deleting photo...',
      success: (message) => message,
      error: (err) => err.message
    });
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">Reference Images</h3>
          <p className="text-sm text-muted-foreground">Upload images to search for similar faces</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          </div>
        ) : referencePhotos.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-muted-foreground">No reference images</p>
            <p className="text-sm text-muted-foreground mt-2">
              Upload images to begin face search
            </p>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Upload Images
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {referencePhotos.map((photo) => (
              <div key={photo.id} className="group relative">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={pb.getFileUrl(photo, photo.photo)}
                    alt="Reference"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(photo.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
        />
      </div>
    </Card>
  );
};

export default SearchItem;
