import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAuthStore from "@/store/authStore";

const UserSettingsItem = ({ userRole = "Member" }) => {
  const { user } = useAuthStore();

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">User Settings</h3>
      <div className="space-y-6">
        <div>
          <Label htmlFor="userEmail">Email Address</Label>
          <Input id="userEmail" value={user?.email || ""} disabled />
        </div>
        <div>
          <Label htmlFor="userName">Display Name</Label>
          <Input id="userName" placeholder="Enter your display name" />
        </div>
        <div>
          <Label htmlFor="userRole">Role</Label>
          <Input id="userRole" value={userRole} disabled />
        </div>
        <div>
          <Label htmlFor="notifications">Notification Preferences</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="emailNotifications" defaultChecked />
              <Label htmlFor="emailNotifications">Email notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="pushNotifications" defaultChecked />
              <Label htmlFor="pushNotifications">Push notifications</Label>
            </div>
            {userRole === "Member" && (
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="alertNotifications" defaultChecked />
                <Label htmlFor="alertNotifications">Alert notifications</Label>
              </div>
            )}
          </div>
        </div>
        {userRole === "Member" && (
          <div>
            <Label htmlFor="alertThreshold">Alert Threshold</Label>
            <Input
              id="alertThreshold"
              type="number"
              placeholder="85"
              min="0"
              max="100"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Minimum confidence percentage to receive alerts
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default UserSettingsItem;
