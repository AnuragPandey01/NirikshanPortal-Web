import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import OrganizationSelectionPage from "@/pages/OrganizationSelectionPage";
import JoinOrganizationPage from "@/pages/JoinOrganizationPage";
import CreateOrganizationPage from "@/pages/CreateOrganizationPage";
import MemberDashboard from "@/pages/MemberDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import PrivateRoute from "@/components/PrivateRoute";
import OrganizationRoute from "@/components/OrganizationRoute";
import useAuthStore from "@/store/authStore";
import LoadingPage from "@/pages/LoadingPage";
import { useNavigate } from "react-router-dom";

// Component to redirect to appropriate dashboard based on user role
const DashboardRedirect = () => {
  const { user, loading } = useAuthStore();

  // Show loading while determining role
  if (loading) {
    return <LoadingPage />;
  }

  // Default to member dashboard if role is not available
  if (user?.org_role === "admin") {
    return <Navigate to="/admin" replace />;
  } else {
    return <Navigate to="/member" replace />;
  }
};

// Auth initialization component
const AuthInitializer = ({ children }) => {
  const navigate = useNavigate();
  const { init, loading } = useAuthStore();

  useEffect(() => {
    async function initAuth() {
      await init();
      if (useAuthStore.getState().user) {
        navigate("/dashboard");
      }
    }
    initAuth();
  }, []);

  // Show loading spinner while initializing auth
  if (loading) {
    return <LoadingPage />;
  }

  return children;
};

function App() {
  return (
    <AuthInitializer>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Private routes that require authentication */}
        <Route
          path="/organization-selection"
          element={
            <PrivateRoute>
              <OrganizationSelectionPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/join-organization"
          element={
            <PrivateRoute>
              <JoinOrganizationPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/create-organization"
          element={
            <PrivateRoute>
              <CreateOrganizationPage />
            </PrivateRoute>
          }
        />

        {/* Organization-protected routes */}
        <Route
          path="/admin"
          element={
            <OrganizationRoute requiredRole="admin">
              <AdminDashboard />
            </OrganizationRoute>
          }
        />
        <Route
          path="/member"
          element={
            <OrganizationRoute requiredRole="member">
              <MemberDashboard />
            </OrganizationRoute>
          }
        />

        {/* Dashboard route that redirects based on role */}
        <Route
          path="/dashboard"
          element={
            <OrganizationRoute>
              <DashboardRedirect />
            </OrganizationRoute>
          }
        />

        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthInitializer>
  );
}

export default App;
