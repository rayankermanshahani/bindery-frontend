// src/components/Home.tsx
import React from "react";
import { Navigate } from "react-router-dom";

const Home: React.FC = () => {
  // Immediately send the user to /clubs
  return <Navigate to="/clubs" replace />;
};

export default Home;
