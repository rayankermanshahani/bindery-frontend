// src/components/PublicRoute.tsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();

  return token ? <Navigate to="/home" replace /> : <>{children}</>;
};

export default PublicRoute;
