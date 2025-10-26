import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

const CasesItem = () => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Active Cases</h3>
      <div className="space-y-4">
        <p className="text-muted-foreground">No active cases found.</p>
        <Button className="w-full justify-start">
          <FileText className="h-4 w-4 mr-2" />
          Create New Case
        </Button>
      </div>
    </Card>
  );
};

export default CasesItem;
