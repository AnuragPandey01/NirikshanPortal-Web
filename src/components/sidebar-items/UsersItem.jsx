import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Copy,
  User,
  Shield,
  UserCog,
  RefreshCw,
  Trash2,
} from "lucide-react";
import useAuthStore from "@/store/authStore";
import { toast } from "sonner";

const roleBadgeClass = {
  admin: "bg-chart-5/15 text-chart-5 ring-1 ring-chart-5/25 dark:bg-chart-5/20",
  member: "bg-chart-4/15 text-chart-4 ring-1 ring-chart-4/25 dark:bg-chart-4/20",
};

function statusBadgeClass(status) {
  if (status === "active") {
    return "bg-chart-2/15 text-chart-2 ring-1 ring-chart-2/25 dark:bg-chart-2/20";
  }
  if (status === "pending") {
    return "bg-chart-4/15 text-chart-4 ring-1 ring-chart-4/25 dark:bg-chart-4/20";
  }
  return "bg-muted text-muted-foreground ring-1 ring-border";
}

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
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-chart-1/10 p-4 dark:bg-chart-1/15">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 shrink-0 text-chart-1" />
            <span className="font-medium text-foreground">Total Members</span>
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-chart-1">
            {loading ? "..." : members.length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-chart-2/10 p-4 dark:bg-chart-2/15">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 shrink-0 text-chart-2" />
            <span className="font-medium text-foreground">Active Members</span>
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-chart-2">
            {loading
              ? "..."
              : members.filter((m) => m.status === "active").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-chart-5/10 p-4 dark:bg-chart-5/15">
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 shrink-0 text-chart-5" />
            <span className="font-medium text-foreground">Pending Invites</span>
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-chart-5">
            {loading
              ? "..."
              : members.filter((m) => m.status === "pending").length}
          </p>
        </div>
      </div>

      {/* Members Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading members...</span>
          </div>
        ) : members.length === 0 ? (
          <div className="py-8 text-center">
            <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground/60" />
            <p className="text-muted-foreground">No members found</p>
            <p className="mt-1 text-sm text-muted-foreground/80">
              Invite members to get started
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-foreground">
                          {member.email}
                        </p>
                        {member.name && member.name !== "Unknown" && (
                          <p className="text-sm text-muted-foreground">
                            {member.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {editingMember === member.id ? (
                      <div className="relative">
                        <select
                          className="w-full rounded-md border border-input bg-background py-1.5 pl-3 pr-8 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                          value={member.role}
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
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          roleBadgeClass[member.role] ??
                          "bg-muted text-muted-foreground ring-1 ring-border"
                        }`}
                      >
                        {member.role.charAt(0).toUpperCase() +
                          member.role.slice(1)}
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClass(
                        member.status
                      )}`}
                    >
                      {member.status.charAt(0).toUpperCase() +
                        member.status.slice(1)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                    {formatDate(member.lastActive)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
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
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
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
      <div className="mt-6 rounded-lg border border-border p-4">
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
