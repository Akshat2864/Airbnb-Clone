
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";
import "./ProtectedRoute.css"

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  // Wait until session verification finishes
  if (loading) {
    return <div className="page-loading">Checking authentication...</div>;
  }

  // Redirect guests to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Allow authenticated users to access the route
  return <Outlet />;
}
