// src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";
import Login from "./components/Login";
import Profile from "./components/Profile";
import Home from "./components/Home";
import DefaultRoute from "./components/DefaultRoute";
import PublicRoute from "./components/PublicRoute";
import PrivateRoute from "./components/PrivateRoute";
import Clubs from "./components/Clubs";
import ClubDashboard from "./components/ClubDashboard";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Default Route */}
          <Route path="/" element={<DefaultRoute />} />

          {/* Login Route */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Home Route */}
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Layout>
                  <Home />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Profile Route */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Layout>
                  <Profile />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Clubs Route */}
          <Route
            path="/clubs"
            element={
              <PrivateRoute>
                <Layout>
                  <Clubs />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/clubs/:unique_id"
            element={
              <PrivateRoute>
                <Layout>
                  <ClubDashboard />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Catch-All Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
