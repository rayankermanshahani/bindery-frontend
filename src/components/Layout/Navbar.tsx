// src/components/Layout/Navbar.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-800">Bindery</span>
            </Link>
          </div>

          {user && (
            <div className="flex items-center">
              <Link
                to="/clubs"
                className="px-3 py-2 text-gray-700 hover:text-gray-900"
              >
                My Clubs
              </Link>
              <div className="ml-4 relative flex-shrink-0">
                <div className="flex items-center">
                  <span className="text-gray-700 mr-4">{user.username}</span>
                  <button
                    onClick={logout}
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
