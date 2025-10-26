import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Sidebar from "@/components/ui/sidebar";
import {
  FileText,
  Users,
  LogOut,
  User,
  Camera,
  BarChart,
  Search,
  AlertCircle,
} from "lucide-react";
import useAuthStore from "@/store/authStore";

const MemberDashboard = () => {
  const { user, organization, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState("cases");
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const sidebarItems = [
    { id: "cases", label: "Cases", icon: FileText },
    { id: "surveillance", label: "Surveillance", icon: Camera },
    { id: "search", label: "Person Search", icon: Search },
    { id: "analytics", label: "Analytics", icon: BarChart },
    { id: "alerts", label: "Alerts", icon: AlertCircle },
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
                <h1 className="text-lg font-semibold">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h1>
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
            {activeTab === "cases" && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Active Cases</h3>
                <div className="space-y-4">
                  <p className="text-muted-foreground">No active cases found.</p>
                  <Button className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Create New Case
                  </Button>
                </div>
              </Card>
            )}

            {activeTab === "surveillance" && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Surveillance Feeds</h3>
                <div className="space-y-4">
                  <p className="text-muted-foreground">No active feeds available.</p>
                  <Button className="w-full justify-start">
                    <Camera className="h-4 w-4 mr-2" />
                    Connect New Feed
                  </Button>
                </div>
              </Card>
            )}

            {activeTab === "search" && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Person Search</h3>
                <div className="space-y-4">
                  <p className="text-muted-foreground">Upload an image to start searching.</p>
                  <Button className="w-full justify-start">
                    <Search className="h-4 w-4 mr-2" />
                    New Search
                  </Button>
                </div>
              </Card>
            )}

            {activeTab === "analytics" && (
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
            )}

            {activeTab === "alerts" && (
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
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MemberDashboard;