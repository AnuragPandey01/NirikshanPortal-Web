import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Scan,
  FileText,
  Users,
  Settings,
  LogOut,
  Building2,
  User,
  UserPlus,
  Copy,
  Crown,
} from "lucide-react";
import useAuthStore from "@/store/authStore";

const AdminDashboard = () => {
  const { user, organization, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState("upload");
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    // TODO: Implement invite member functionality
    console.log("Inviting member:", inviteEmail);
    setInviteEmail("");
    setShowInviteForm(false);
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(organization?.invite_code || "");
    // TODO: Show toast notification
  };

  const tabs = [
    { id: "upload", label: "Upload", icon: Upload },
    { id: "scan", label: "Scan", icon: Scan },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "team", label: "Team", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <div className="ml-3">
                <div className="flex items-center">
                  <h1 className="text-lg font-semibold">Nirikshan Portal</h1>
                  <Crown className="h-4 w-4 text-yellow-500 ml-2" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {organization?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-sm font-medium">{user?.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Admin Dashboard</h2>
              <p className="text-muted-foreground">
                Manage your organization <strong>{organization?.name}</strong>{" "}
                and team members.
              </p>
            </div>
            <div className="flex space-x-3">
              <Button onClick={() => setShowInviteForm(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
              <Button variant="outline" onClick={copyInviteCode}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Invite Code
              </Button>
            </div>
          </div>
        </div>

        {/* Organization Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Team Members
                </p>
                <p className="text-2xl font-semibold">1</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Documents
                </p>
                <p className="text-2xl font-semibold">0</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Invite Code
                </p>
                <p className="text-lg font-mono font-semibold">
                  {organization?.invite_code}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "upload" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Upload Documents</h3>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Drag and drop files here, or click to browse
                    </p>
                    <Button>Choose Files</Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Supported formats: PDF, DOC, DOCX, TXT</p>
                    <p>Maximum file size: 10MB</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Uploads</h3>
                <div className="space-y-3">
                  <div className="text-center py-4 text-muted-foreground">
                    <p className="text-sm">No recent uploads</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "scan" && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Document Scanner</h3>
              <div className="text-center py-12">
                <Scan className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium mb-2">
                  Scanner Not Available
                </h4>
                <p className="text-muted-foreground mb-6">
                  Document scanning feature is coming soon. For now, you can
                  upload documents using the Upload tab.
                </p>
                <Button onClick={() => setActiveTab("upload")}>
                  Go to Upload
                </Button>
              </div>
            </Card>
          )}

          {activeTab === "documents" && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">All Documents</h3>
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium mb-2">No Documents Yet</h4>
                <p className="text-muted-foreground mb-6">
                  Upload your first document to get started with document
                  management.
                </p>
                <Button onClick={() => setActiveTab("upload")}>
                  Upload Document
                </Button>
              </div>
            </Card>
          )}

          {activeTab === "team" && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Team Members</h3>
                  <Button onClick={() => setShowInviteForm(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{user?.email}</p>
                        <p className="text-xs text-muted-foreground">Admin</p>
                      </div>
                    </div>
                    <Crown className="h-4 w-4 text-yellow-500" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Organization Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="orgName">Organization Name</Label>
                    <Input
                      id="orgName"
                      value={organization?.name || ""}
                      className="mt-1"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="inviteCode">Invite Code</Label>
                    <div className="flex mt-1">
                      <Input
                        id="inviteCode"
                        value={organization?.invite_code || ""}
                        className="font-mono"
                        readOnly
                      />
                      <Button
                        variant="outline"
                        onClick={copyInviteCode}
                        className="ml-2"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">Invite Team Member</h3>
            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-3">
                <Button type="submit" className="flex-1">
                  Send Invite
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInviteForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
