// src/components/Layout/Navbar.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ConfirmModal from "../ConfirmModal";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // custom confirmation state
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate("/login");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to={user ? "/home" : "/"} className="flex items-center">
              <span className="text-xl font-bold text-gray-800">Bindery</span>
            </Link>
          </div>

          {user && (
            <div className="flex items-center">
              <Link
                to="/profile"
                className="px-3 py-2 text-large font-medium text-gray-600 hover:text-gray-900"
              >
                Profile
              </Link>
              <button
                onClick={handleLogoutClick}
                className="ml-2 px-3 py-2 text-large font-medium text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Custom confirmation modal for logging out */}
      <ConfirmModal
        show={showLogoutModal}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </nav>
  );
};

export default Navbar;
