import { Card } from "@/components/ui/card";

const AlertsItem = () => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Alerts</h3>
      <div className="space-y-4">
        <p className="text-muted-foreground">No alerts found.</p>
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm">Notification Settings</p>
          <p className="text-muted-foreground text-sm">
            You will receive alerts for matches above 85% confidence
          </p>
        </div>
      </div>
    </Card>
  );
};

export default AlertsItem;
