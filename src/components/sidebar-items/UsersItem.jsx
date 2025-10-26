import { useState, useEffect } from "react";
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
  ChevronDown,
  RefreshCw,
  Trash2,
} from "lucide-react";
import useAuthStore from "@/store/authStore";
import { toast } from "sonner";

const roleColors = {
  admin: "bg-purple-100 text-purple-800",
  member: "bg-orange-100 text-orange-800",
};

const availableRoles = ["admin", "member"];

const UsersItem = () => {
  const {
    user,
    organization,
    fetchOrganizationMembers,
    updateMemberRole,
    removeMember,
    refreshOrganization,
  } = useAuthStore();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [actionLoading, setActionLoading] = useState({});

  // Fetch members on component mount
  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const membersData = await fetchOrganizationMembers();
      setMembers(membersData);
    } catch (error) {
      toast.error("Failed to load members");
      console.error("Error loading members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    setActionLoading((prev) => ({ ...prev, [memberId]: true }));
    try {
      await updateMemberRole(memberId, newRole);
      setMembers(
        members.map((member) =>
          member.id === memberId ? { ...member, role: newRole } : member
        )
      );
      toast.success("Member role updated successfully");
    } catch (error) {
      toast.error("Failed to update member role");
      console.error("Error updating role:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [memberId]: false }));
      setEditingMember(null);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (
      !confirm(
        "Are you sure you want to remove this member from the organization?"
      )
    ) {
      return;
    }

    setActionLoading((prev) => ({ ...prev, [memberId]: true }));
    try {
      await removeMember(memberId);
      setMembers(members.filter((m) => m.id !== memberId));
      await refreshOrganization(); // Update member count
      toast.success("Member removed successfully");
    } catch (error) {
      toast.error("Failed to remove member");
      console.error("Error removing member:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [memberId]: false }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(organization?.id || "");
    toast.success("Organization ID copied to clipboard");
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold">Team Members</h3>
          <p className="text-sm text-muted-foreground">
            Manage team access and roles
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadMembers}
          disabled={loading}
          className="flex items-center"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Member Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Total Members</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            {loading ? "..." : members.length}
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="font-medium">Active Members</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            {loading
              ? "..."
              : members.filter((m) => m.status === "active").length}
          </p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-purple-600" />
            <span className="font-medium">Pending Invites</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            {loading
              ? "..."
              : members.filter((m) => m.status === "pending").length}
          </p>
        </div>
      </div>

      {/* Members Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading members...</span>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No members found</p>
            <p className="text-sm text-gray-400">
              Invite members to get started
            </p>
          </div>
        ) : (
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
                        {member.name && member.name !== "Unknown" && (
                          <p className="text-sm text-gray-500">{member.name}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingMember === member.id ? (
                      <div className="relative">
                        <select
                          className="w-full rounded-md border border-gray-300 bg-white py-1 pl-3 pr-8 text-sm"
                          value={selectedRole || member.role}
                          onChange={(e) =>
                            handleRoleChange(member.id, e.target.value)
                          }
                          disabled={actionLoading[member.id]}
                        >
                          {availableRoles.map((role) => (
                            <option key={role} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          roleColors[member.role]
                        }`}
                      >
                        {member.role.charAt(0).toUpperCase() +
                          member.role.slice(1)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        member.status === "active"
                          ? "bg-green-100 text-green-800"
                          : member.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {member.status.charAt(0).toUpperCase() +
                        member.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(member.lastActive)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setEditingMember(
                            editingMember === member.id ? null : member.id
                          )
                        }
                        disabled={actionLoading[member.id]}
                        title="Edit Role"
                      >
                        <UserCog className="h-4 w-4" />
                      </Button>
                      {member.memberId !== user?.user_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={actionLoading[member.id]}
                          title="Remove Member"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Organization ID Section */}
      <div className="mt-6 p-4 border rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium">Organization ID</h4>
            <p className="text-sm text-muted-foreground">
              Share this ID along with invite codes to add new members
            </p>
          </div>
          <Button variant="ghost" onClick={copyInviteCode}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
        </div>
        <code className="block mt-2 p-2 bg-muted rounded">
          {organization?.id || "No organization ID available"}
        </code>
      </div>
    </Card>
  );
};

export default UsersItem;
