import { Card } from "@/components/ui/card";

const AnalyticsItem = () => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Analytics Dashboard</h3>
      <div className="space-y-4">
        <p className="text-muted-foreground">No analytics data available.</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Total Cases</p>
            <p className="text-2xl font-semibold">0</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Active Searches</p>
            <p className="text-2xl font-semibold">0</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AnalyticsItem;
