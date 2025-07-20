// src/components/PrivateRoute.jsx

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// A route wrapper that requires authentication
// Renders children only if the user is logged in; otherwise, redirects to the login page
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // If authentication status is still loading, render nothing (you can replace this with a loading spinner if needed)
  if (loading) return null;

  // If the user is authenticated, render the protected content; otherwise, redirect to login
  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
