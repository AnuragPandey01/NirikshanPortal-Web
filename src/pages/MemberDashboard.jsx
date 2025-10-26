import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/ui/sidebar";
import {
  FileText,
  LogOut,
  User,
  Camera,
  BarChart,
  Search,
  AlertCircle,
} from "lucide-react";
import useAuthStore from "@/store/authStore";

// Import sidebar item components
import CasesItem from "@/components/sidebar-items/CasesItem";
import SurveillanceItem from "@/components/sidebar-items/SurveillanceItem";
import SearchItem from "@/components/sidebar-items/SearchItem";
import AnalyticsItem from "@/components/sidebar-items/AnalyticsItem";
import AlertsItem from "@/components/sidebar-items/AlertsItem";
import UserSettingsItem from "@/components/sidebar-items/UserSettingsItem";

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

  const mainItems = [
    { id: "cases", label: "Cases", icon: FileText },
    { id: "surveillance", label: "Surveillance", icon: Camera },
    { id: "search", label: "Person Search", icon: Search },
    { id: "analytics", label: "Analytics", icon: BarChart },
    { id: "alerts", label: "Alerts", icon: AlertCircle },
  ];

  const userSettingsItems = [
    { id: "user-settings", label: "User Settings", icon: User },
  ];

  return (
    <div className="min-h-screen bg-muted flex">
      <Sidebar
        mainItems={mainItems}
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
            {activeTab === "cases" && <CasesItem />}
            {activeTab === "surveillance" && <SurveillanceItem />}
            {activeTab === "search" && <SearchItem />}
            {activeTab === "analytics" && <AnalyticsItem />}
            {activeTab === "alerts" && <AlertsItem />}
            {activeTab === "user-settings" && (
              <UserSettingsItem userRole="Member" />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MemberDashboard;
