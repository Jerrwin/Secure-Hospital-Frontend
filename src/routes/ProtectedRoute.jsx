import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../modules/auth/hooks/useAuth";
import LoadingScreen from "../components/common/LoadingScreen";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // If we are currently checking the session (after F5), wait!
  // Don't redirect to login until we know for sure they aren't authenticated.
  if (isLoading) {
    return <LoadingScreen fullPage label="Authenticating..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
