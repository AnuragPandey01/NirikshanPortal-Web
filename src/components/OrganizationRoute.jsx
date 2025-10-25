import { Navigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";

const OrganizationRoute = ({ children, requiredRole = null }) => {
  const { user, needsOrgSelection, loading } = useAuthStore();

  // Show loading spinner while checking authentication
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

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user needs organization selection, redirect to organization selection
  if (needsOrgSelection) {
    return <Navigate to="/organization-selection" replace />;
  }

  // If role is required, check user's role
  if (requiredRole && user.org_role !== requiredRole) {
    // Redirect to appropriate dashboard based on user's actual role
    if (user.org_role === "admin") {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/member" replace />;
    }
  }

  // If user is authenticated and has organization, render the protected component
  return children;
};

export default OrganizationRoute;
