import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  UserPlus, 
  Copy, 
  User, 
  Shield, 
  UserCog, 
  MoreVertical,
  ChevronDown 
} from "lucide-react";
import useAuthStore from "@/store/authStore";

// Mock data for existing members
const mockMembers = [
  { id: 1, email: "admin@police.gov", role: "Admin", status: "Active", lastActive: "2023-10-26" },
  { id: 2, email: "investigator1@police.gov", role: "Member", status: "Active", lastActive: "2023-10-25" },
  { id: 3, email: "analyst1@police.gov", role: "Member", status: "Active", lastActive: "2023-10-24" },
  { id: 4, email: "officer1@police.gov", role: "Member", status: "Inactive", lastActive: "2023-10-20" },
];

const roleColors = {
  Admin: "bg-purple-100 text-purple-800",
  Member: "bg-orange-100 text-orange-800"
};

const availableRoles = ["Admin","Member"];

const UsersItem = () => {
  const { user, organization } = useAuthStore();
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [members, setMembers] = useState(mockMembers);
  const [editingMember, setEditingMember] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  const handleInviteMember = async (e) => {
    e.preventDefault();
    // Add new member with default role
    const newMember = {
      id: members.length + 1,
      email: inviteEmail,
      role: "Member",
      status: "Pending",
      lastActive: new Date().toISOString().split('T')[0]
    };
    setMembers([...members, newMember]);
    setInviteEmail("");
    setShowInviteForm(false);
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(organization?.invite_code || "");
  };

  const handleRoleChange = (memberId, newRole) => {
    setMembers(members.map(member => 
      member.id === memberId 
        ? { ...member, role: newRole }
        : member
    ));
    setEditingMember(null);
  };

  const handleStatusToggle = (memberId) => {
    setMembers(members.map(member =>
      member.id === memberId
        ? { ...member, status: member.status === "Active" ? "Inactive" : "Active" }
        : member
    ));
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold">Team Members</h3>
          <p className="text-sm text-muted-foreground">Manage team access and roles</p>
        </div>
        {/* <Button onClick={() => setShowInviteForm(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button> */}
      </div>

      {/* {showInviteForm && (
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
      )} */}

      {/* Member Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Total Members</span>
          </div>
          <p className="text-2xl font-bold mt-2">{members.length}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="font-medium">Active Members</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            {members.filter(m => m.status === "Active").length}
          </p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-purple-600" />
            <span className="font-medium">Pending Invites</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            {members.filter(m => m.status === "Pending").length}
          </p>
        </div>
      </div>

      {/* Members Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Active
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {members.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingMember === member.id ? (
                    <div className="relative">
                      <select
                        className="w-full rounded-md border border-gray-300 bg-white py-1 pl-3 pr-8 text-sm"
                        value={selectedRole || member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      >
                        {availableRoles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${roleColors[member.role]}`}>
                      {member.role}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    member.status === "Active" 
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {member.lastActive}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setEditingMember(editingMember === member.id ? null : member.id)}
                    >
                      <UserCog className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleStatusToggle(member.id)}
                    >
                      {member.status === "Active" ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* <div className="mt-6 p-4 border rounded-lg">
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
      </div> */}
    </Card>
  );
};

export default UsersItem;