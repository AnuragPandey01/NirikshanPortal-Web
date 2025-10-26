import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

const SurveillanceItem = () => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Uploaded Video</h3>
      <div className="space-y-4">
        <p className="text-muted-foreground">No video available.</p>
        <Button className="w-full justify-start">
          <Camera className="h-4 w-4 mr-2" />
          Upload Video
        </Button>
      </div>
    </Card>
  );
};

export default SurveillanceItem;
