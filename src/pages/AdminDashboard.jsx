import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Sidebar from "@/components/ui/sidebar";
import {
  FileText,
  Users,
  Settings,
  LogOut,
  User,
  UserPlus,
  Copy,
  Crown,
  Camera,
  BarChart,
  Search,
  AlertCircle,
  Shield,
} from "lucide-react";
import useAuthStore from "@/store/authStore";

const AdminDashboard = () => {
  const { user, organization, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState("dashboard");
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
    console.log("Inviting member:", inviteEmail);
    setInviteEmail("");
    setShowInviteForm(false);
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(organization?.invite_code || "");
  };

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart },
    { id: "cases", label: "Cases", icon: FileText },
    { id: "surveillance", label: "Surveillance", icon: Camera },
    { id: "search", label: "Person Search", icon: Search },
    { id: "analytics", label: "Analytics", icon: BarChart },
    { id: "alerts", label: "Alerts", icon: AlertCircle },
    { id: "users", label: "Users", icon: Users },
    { id: "settings", label: "Settings", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-muted flex">
      <Sidebar 
        items={sidebarItems} 
        activeItem={activeTab} 
        onItemClick={setActiveTab} 
      />
      
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="ml-3">
                <div className="flex items-center">
                  <h1 className="text-lg font-semibold">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                  </h1>
                  <Crown className="h-4 w-4 text-yellow-500 ml-2" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {organization?.name}
                </p>
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

        {/* Main Content */}
        <main className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeTab === "dashboard" && (
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
                    <Button className="w-full justify-start" onClick={() => setActiveTab("search")}>
                      <Search className="h-4 w-4 mr-2" />
                      New Person Search
                    </Button>
                    <Button className="w-full justify-start" onClick={() => setActiveTab("cases")}>
                      <FileText className="h-4 w-4 mr-2" />
                      Create New Case
                    </Button>
                    <Button className="w-full justify-start" onClick={() => setActiveTab("surveillance")}>
                      <Camera className="h-4 w-4 mr-2" />
                      View Surveillance
                    </Button>
                  </div>
                </Card>
              </>
            )}

            {activeTab === "users" && (
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
            )}

            {activeTab === "settings" && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-6">Organization Settings</h3>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="orgName">Organization Name</Label>
                    <Input
                      id="orgName"
                      value={organization?.name || ""}
                      disabled
                    />
                  </div>
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;