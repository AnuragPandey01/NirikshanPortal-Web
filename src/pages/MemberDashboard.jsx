import { useState } from "react";
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
} from "lucide-react";
import useAuthStore from "@/store/authStore";

const MemberDashboard = () => {
  const { user, organization, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState("upload");

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const tabs = [
    { id: "upload", label: "Upload", icon: Upload },
    { id: "scan", label: "Scan", icon: Scan },
    { id: "documents", label: "Documents", icon: FileText },
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
                <h1 className="text-lg font-semibold">Nirikshan Portal</h1>
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
          <h2 className="text-2xl font-semibold mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">
            You're a member of <strong>{organization?.name}</strong>. Upload and
            scan documents to get started.
          </p>
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
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium">document.pdf</p>
                        <p className="text-xs text-muted-foreground">
                          2 hours ago
                        </p>
                      </div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Processed
                    </span>
                  </div>
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
        </div>

        {/* Member Notice */}
        <div className="mt-8">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start">
              <Users className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">
                  Member Access
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  You have member-level access. Contact your organization admin
                  to request additional permissions or team management features.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
