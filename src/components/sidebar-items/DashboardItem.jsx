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
import { PB_COLLECTIONS } from "@/lib/pbCollections";
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
          pb.collection(PB_COLLECTIONS.CASES).getFullList(),
          pb.collection(PB_COLLECTIONS.CCTV_FOOTAGE).getFullList(),
          pb.collection(PB_COLLECTIONS.REFERENCE_PHOTO).getFullList(),
          pb.collection(PB_COLLECTIONS.ORGANISATION_MEMBERS).getFullList(),
        ]);

      // Get recent cases for display
      const recentCasesData = await pb.collection(PB_COLLECTIONS.CASES).getList(
        1,
        5,
        {
          sort: "-created",
          expand: "video,photo",
        }
      );

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
            <div className="flex justify-between items-center rounded-lg border border-border bg-chart-1/10 p-4 dark:bg-chart-1/15">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 shrink-0 text-chart-1" />
                <span className="font-medium text-foreground">Total Cases</span>
              </div>
              <span className="text-2xl font-bold tabular-nums text-chart-1">
                {stats.totalCases}
              </span>
            </div>
            <div className="flex justify-between items-center rounded-lg border border-border bg-chart-2/10 p-4 dark:bg-chart-2/15">
              <div className="flex items-center space-x-3">
                <Camera className="h-5 w-5 shrink-0 text-chart-2" />
                <span className="font-medium text-foreground">
                  Surveillance Videos
                </span>
              </div>
              <span className="text-2xl font-bold tabular-nums text-chart-2">
                {stats.surveillanceVideos}
              </span>
            </div>
            <div className="flex justify-between items-center rounded-lg border border-border bg-chart-4/10 p-4 dark:bg-chart-4/15">
              <div className="flex items-center space-x-3">
                <Image className="h-5 w-5 shrink-0 text-chart-4" />
                <span className="font-medium text-foreground">
                  Reference Photos
                </span>
              </div>
              <span className="text-2xl font-bold tabular-nums text-chart-4">
                {stats.referencePhotos}
              </span>
            </div>
            <div className="flex justify-between items-center rounded-lg border border-border bg-chart-3/10 p-4 dark:bg-chart-3/15">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 shrink-0 text-chart-3" />
                <span className="font-medium text-foreground">
                  Organization Members
                </span>
              </div>
              <span className="text-2xl font-bold tabular-nums text-chart-3">
                {stats.organizationMembers}
              </span>
            </div>
          </div>
        )}
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
                className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-4 transition-colors hover:bg-muted/70"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 shrink-0 text-chart-1" />
                    <span className="truncate text-sm font-medium text-foreground">
                      {caseItem.name || `Case #${caseItem.id.slice(-8)}`}
                    </span>
                  </div>
                  {caseItem.description && (
                    <p className="mt-2 truncate text-xs text-muted-foreground">
                      {caseItem.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center text-xs text-muted-foreground">
                    <Calendar className="mr-1 h-3 w-3" />
                    <span>
                      {new Date(caseItem.created).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex items-center space-x-3">
                  {caseItem.expand?.video && (
                    <div className="flex items-center rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
                      <Camera className="mr-1 h-3 w-3" />
                      <span>Video</span>
                    </div>
                  )}
                  {caseItem.expand?.photo && (
                    <div className="flex items-center rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
                      <Image className="mr-1 h-3 w-3" />
                      <span>Photo</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/60" />
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
