// src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import Login from "./components/Login";
import Profile from "./components/Profile";
import PublicRoute from "./components/routes/PublicRoute";
import PrivateRoute from "./components/routes/PrivateRoute";
import Clubs from "./components/Clubs";
import ClubDashboard from "./components/ClubDashboard";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Root path: redirects to /clubs. PrivateRoute on /clubs handles redirection to /login */}
          <Route path="/" element={<Navigate to="/clubs" replace />} />

          {/* Login Route (Public) */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Clubs List (Private) */}
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

          {/* Single Club Dashboard (Private) */}
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

          {/* Profile (Private) */}
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

          {/* Catch-all -> go to "/" which redirects to "/clubs" or "/login"  */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
