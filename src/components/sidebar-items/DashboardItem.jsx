import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Search, FileText, Camera } from "lucide-react";

const DashboardItem = ({ setActiveTab }) => {
  return (
    <>
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">System Overview</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Active Cases</span>
            <span className="font-semibold">0</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Surveillance Feeds</span>
            <span className="font-semibold">0</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Pending Alerts</span>
            <span className="font-semibold">0</span>
          </div>
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="space-y-4">
          <Button
            className="w-full justify-start"
            onClick={() => setActiveTab("search")}
          >
            <Search className="h-4 w-4 mr-2" />
            New Person Search
          </Button>
          <Button
            className="w-full justify-start"
            onClick={() => setActiveTab("cases")}
          >
            <FileText className="h-4 w-4 mr-2" />
            Create New Case
          </Button>
          <Button
            className="w-full justify-start"
            onClick={() => setActiveTab("surveillance")}
          >
            <Camera className="h-4 w-4 mr-2" />
            View Surveillance
          </Button>
        </div>
      </Card>
    </>
  );
};

export default DashboardItem;
