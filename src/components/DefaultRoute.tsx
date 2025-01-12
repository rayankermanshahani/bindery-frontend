// src/components/DefaultRoute.tsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const DefaultRoute: React.FC = () => {
  const { token } = useAuth();

  return token ? (
    <Navigate to="/profile" replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default DefaultRoute;
