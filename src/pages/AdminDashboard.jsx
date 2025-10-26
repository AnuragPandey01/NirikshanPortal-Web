import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/ui/sidebar";
import {
  Users,
  FileText,
  LogOut,
  User,
  Crown,
  Camera,
  BarChart,
  Search,
  AlertCircle,
  Building2,
} from "lucide-react";
import useAuthStore from "@/store/authStore";

// Import sidebar item components
import DashboardItem from "@/components/sidebar-items/DashboardItem";
import CasesItem from "@/components/sidebar-items/CasesItem";
import SurveillanceItem from "@/components/sidebar-items/SurveillanceItem";
import SearchItem from "@/components/sidebar-items/SearchItem";
import AnalyticsItem from "@/components/sidebar-items/AnalyticsItem";
import AlertsItem from "@/components/sidebar-items/AlertsItem";
import UsersItem from "@/components/sidebar-items/UsersItem";
import OrganizationSettingsItem from "@/components/sidebar-items/OrganizationSettingsItem";
import UserSettingsItem from "@/components/sidebar-items/UserSettingsItem";

const AdminDashboard = () => {
  const { user, organization, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const mainItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart },
    { id: "cases", label: "Cases", icon: FileText },
    { id: "surveillance", label: "Upload Video", icon: Camera },
    { id: "search", label: "Person Search", icon: Search },
    { id: "analytics", label: "Analytics", icon: BarChart },
    { id: "alerts", label: "Alerts", icon: AlertCircle },
    { id: "users", label: "Users", icon: Users },
  ];

  const orgSettingsItems = [
    { id: "org-settings", label: "Organization Settings", icon: Building2 },
  ];

  const userSettingsItems = [
    { id: "user-settings", label: "User Settings", icon: User },
  ];

  return (
    <div className="min-h-screen bg-muted flex">
      <Sidebar
        mainItems={mainItems}
        orgSettingsItems={orgSettingsItems}
        userSettingsItems={userSettingsItems}
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
          {activeTab === "dashboard" && (
            <DashboardItem setActiveTab={setActiveTab} />
          )}
          {activeTab === "cases" && <CasesItem />}
          {activeTab === "surveillance" && <SurveillanceItem />}
          {activeTab === "search" && <SearchItem />}
          {activeTab === "analytics" && <AnalyticsItem />}
          {activeTab === "alerts" && <AlertsItem />}
          {activeTab === "users" && <UsersItem />}
          {activeTab === "org-settings" && <OrganizationSettingsItem />}
          {activeTab === "user-settings" && (
            <UserSettingsItem userRole="Admin" />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
