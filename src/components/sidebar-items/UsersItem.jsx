import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Copy, User } from "lucide-react";
import useAuthStore from "@/store/authStore";

const UsersItem = () => {
  const { user, organization } = useAuthStore();
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);

  const handleInviteMember = async (e) => {
    e.preventDefault();
    console.log("Inviting member:", inviteEmail);
    setInviteEmail("");
    setShowInviteForm(false);
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(organization?.invite_code || "");
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Team Members</h3>
        <Button onClick={() => setShowInviteForm(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {showInviteForm && (
        <form onSubmit={handleInviteMember} className="mb-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            <div className="flex space-x-2">
              <Button type="submit">Send Invite</Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowInviteForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">{user?.email}</p>
              <p className="text-sm text-muted-foreground">Admin</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 border rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium">Invite Code</h4>
            <p className="text-sm text-muted-foreground">
              Share this code to invite team members
            </p>
          </div>
          <Button variant="ghost" onClick={copyInviteCode}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
        </div>
        <code className="block mt-2 p-2 bg-muted rounded">
          {organization?.invite_code}
        </code>
      </div>
    </Card>
  );
};

export default UsersItem;
