// src/frontend/src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    // Save the attempted location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If there are children, render them, otherwise render the outlet
  return <>{children ? children : <Outlet />}</>;
};

export default ProtectedRoute;