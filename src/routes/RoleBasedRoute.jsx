import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../modules/auth/hooks/useAuth";

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  // If not logged in at all, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Normalize role and check permission
  const userRole = (user?.role || "").toUpperCase();
  const isAllowed = allowedRoles.includes(userRole);

  if (!isAllowed) {
    // If user is logged in but doesn't have the right role, 
    // send them back to the dashboard.
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleBasedRoute;
