import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const SearchItem = () => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Person Search</h3>
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Upload an image to start searching.
        </p>
        <Button className="w-full justify-start">
          <Search className="h-4 w-4 mr-2" />
          New Search
        </Button>
      </div>
    </Card>
  );
};

export default SearchItem;
