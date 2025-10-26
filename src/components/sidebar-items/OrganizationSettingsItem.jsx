import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAuthStore from "@/store/authStore";

const OrganizationSettingsItem = () => {
  const { organization } = useAuthStore();

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">Organization Settings</h3>
      <div className="space-y-6">
        <div>
          <Label htmlFor="orgName">Organization Name</Label>
          <Input id="orgName" value={organization?.name || ""} disabled />
        </div>
        <div>
          <Label htmlFor="orgDescription">Description</Label>
          <Input
            id="orgDescription"
            placeholder="Enter organization description"
          />
        </div>
        <div>
          <Label htmlFor="orgTimezone">Timezone</Label>
          <Input id="orgTimezone" placeholder="Select timezone" />
        </div>
      </div>
    </Card>
  );
};

export default OrganizationSettingsItem;
