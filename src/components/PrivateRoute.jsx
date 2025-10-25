import { Navigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuthStore();

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingPage />;
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated, render the protected component
  return children;
};

export default PrivateRoute;
