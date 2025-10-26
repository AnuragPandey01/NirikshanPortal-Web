import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  FileText,
  Camera,
  Loader2,
  RefreshCw,
  Users,
  Image,
  Calendar,
} from "lucide-react";
import pb from "@/lib/pb";
import useAuthStore from "@/store/authStore";

const DashboardItem = ({ setActiveTab }) => {
  const { organization } = useAuthStore();
  const [stats, setStats] = useState({
    totalCases: 0,
    surveillanceVideos: 0,
    referencePhotos: 0,
    organizationMembers: 0,
  });
  const [recentCases, setRecentCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, [organization]);

  const fetchDashboardStats = async () => {
    if (!organization?.id) {
      setLoading(false);
      return;
    }

    try {
      // Fetch all statistics in parallel - using getFullList for accurate counts
      const [casesResult, videosResult, photosResult, membersResult] =
        await Promise.all([
          pb.collection("Cases").getFullList({
            filter: `organisation = "${organization.id}"`,
          }),
          pb.collection("CctvFootage").getFullList({
            filter: `organisation = "${organization.id}"`,
            sort: "-created",
          }),
          pb.collection("ReferencePhoto").getFullList({
            filter: `organisation = "${organization.id}"`,
            sort: "-created",
          }),
          pb.collection("OrganisationMembers").getFullList({
            filter: `organisation = "${organization.id}"`,
          }),
        ]);

      // Get recent cases for display
      const recentCasesData = await pb.collection("Cases").getList(1, 5, {
        filter: `organisation = "${organization.id}"`,
        sort: "-created",
        expand: "video,photo",
      });

      // Debug logging to check the actual counts
      console.log("Dashboard stats:", {
        casesCount: casesResult.length,
        videosCount: videosResult.length,
        photosCount: photosResult.length,
        membersCount: membersResult.length,
      });

      setStats({
        totalCases: casesResult.length,
        surveillanceVideos: videosResult.length,
        referencePhotos: photosResult.length,
        organizationMembers: membersResult.length,
      });

      setRecentCases(recentCasesData.items);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardStats();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">System Overview</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">
              Loading statistics...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Total Cases</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {stats.totalCases}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Camera className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Surveillance Videos</span>
              </div>
              <span className="text-2xl font-bold text-purple-600">
                {stats.surveillanceVideos}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Image className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Reference Photos</span>
              </div>
              <span className="text-2xl font-bold text-orange-600">
                {stats.referencePhotos}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-indigo-600" />
                <span className="font-medium">Organization Members</span>
              </div>
              <span className="text-2xl font-bold text-indigo-600">
                {stats.organizationMembers}
              </span>
            </div>
          </div>
        )}
      </Card>
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            className="w-full justify-start h-12"
            onClick={() => setActiveTab("search")}
          >
            <Image className="h-4 w-4 mr-3" />
            Upload Reference Photo
          </Button>
          <Button
            className="w-full justify-start h-12"
            onClick={() => setActiveTab("cases")}
          >
            <FileText className="h-4 w-4 mr-3" />
            Create New Case
          </Button>
          <Button
            className="w-full justify-start h-12"
            onClick={() => setActiveTab("surveillance")}
          >
            <Camera className="h-4 w-4 mr-3" />
            Upload Surveillance Video
          </Button>
          <Button
            className="w-full justify-start h-12"
            onClick={() => setActiveTab("analytics")}
          >
            <BarChart className="h-4 w-4 mr-3" />
            View Analytics
          </Button>
        </div>
      </Card>

      {/* Recent Cases */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Recent Cases</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("cases")}
          >
            View All
          </Button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading...
            </span>
          </div>
        ) : recentCases.length > 0 ? (
          <div className="space-y-4">
            {recentCases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-600 shrink-0" />
                    <span className="font-medium text-sm truncate">
                      {caseItem.name || `Case #${caseItem.id.slice(-8)}`}
                    </span>
                  </div>
                  {caseItem.description && (
                    <p className="text-xs text-gray-600 mt-2 truncate">
                      {caseItem.description}
                    </p>
                  )}
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>
                      {new Date(caseItem.created).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3 ml-4">
                  {caseItem.expand?.video && (
                    <div className="flex items-center text-xs text-gray-500 bg-white px-2 py-1 rounded">
                      <Camera className="h-3 w-3 mr-1" />
                      <span>Video</span>
                    </div>
                  )}
                  {caseItem.expand?.photo && (
                    <div className="flex items-center text-xs text-gray-500 bg-white px-2 py-1 rounded">
                      <Image className="h-3 w-3 mr-1" />
                      <span>Photo</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm font-medium">No cases yet</p>
            <p className="text-xs mt-2 mb-4">
              Create your first case to get started with face recognition
              analysis
            </p>
            <Button size="sm" onClick={() => setActiveTab("cases")}>
              Create Your First Case
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DashboardItem;
