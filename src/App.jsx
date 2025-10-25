import { useEffect } from "react";
import LoginPage from "@/pages/LoginPage";
import OrganizationSelectionPage from "@/pages/OrganizationSelectionPage";
import JoinOrganizationPage from "@/pages/JoinOrganizationPage";
import CreateOrganizationPage from "@/pages/CreateOrganizationPage";
import MemberDashboard from "@/pages/MemberDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import useAuthStore from "@/store/authStore";

function App() {
  const { user, loading, needsOrgSelection, init } =
    useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  // Show loading spinner while initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle routing based on current URL path
  const currentPath = window.location.pathname;

  // If user is not authenticated, show login page
  if (!user) {
    return <LoginPage />;
  }

  // If user needs to select/create organization
  if (needsOrgSelection) {
    if (currentPath === "/join-organization") {
      return <JoinOrganizationPage />;
    }
    if (currentPath === "/create-organization") {
      return <CreateOrganizationPage />;
    }
    return <OrganizationSelectionPage />;
  }

  if (user.org_role === "admin") {
    return <AdminDashboard />;
  } else {
    return <MemberDashboard />;
  }
}

export default App;
