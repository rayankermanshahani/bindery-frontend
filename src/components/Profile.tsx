// src/components/Profile.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { User } from "../types/auth";
import { Club } from "../types/club";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { token, setUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // for editing username
  const [editing, setEditing] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>("");
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<boolean>(false);

  // for user's created clubs
  const [createdClubs, setCreatedClubs] = useState<Club[]>([]);
  const [clubsError, setClubsError] = useState<string | null>(null);

  const fetchProfile = React.useCallback(async () => {
    if (!token) {
      setError("No authentication token found.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const fetchedUser: User = {
        id: response.data.id,
        username: response.data.username,
        created_at: response.data.created_at,
      };

      setProfile(fetchedUser);
      setUser(fetchedUser);
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError("Failed to fetch profile.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchCreatedClubs = async () => {
    if (!token) return;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/clubs/created`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setCreatedClubs(res.data);
    } catch (err) {
      console.error("Error fetching created clubs:", err);
      setClubsError("Failed to fetch clubs you created");
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchCreatedClubs();
  }, [fetchProfile]);

  const handleEdit = () => {
    setNewUsername(profile?.username || "");
    setEditing(true);
    setUpdateError(null);
  };

  const handleCancel = () => {
    setEditing(false);
    setUpdateError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      setUpdateError("Username cannot be empty.");
      return;
    }

    setUpdating(true);
    setUpdateError(null);

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/auth/profile`,
        {
          username: newUsername.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const updatedUser: User = {
        id: response.data.id,
        username: response.data.username,
        created_at: response.data.created_at,
      };

      setProfile(updatedUser);
      setUser(updatedUser);
      setEditing(false);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setUpdateError(err.response.data.error);
      } else {
        setUpdateError("Failed to update username.");
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!profile) {
    return <div>No profile data available.</div>;
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>

      {/* Username */}
      <div className="mb-4">
        <strong>Username:</strong>{" "}
        {editing ? (
          <form onSubmit={handleSubmit} className="mt-2">
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="border rounded px-2 py-1 w-full"
              disabled={updating}
            />
            {updateError && (
              <p className="text-red-500 text-sm mt-1">{updateError}</p>
            )}
            <div className="mt-2 flex space-x-2">
              <button
                type="submit"
                className="px-3 py-1 bg-blue-500 text-white rounded"
                disabled={updating}
              >
                {updating ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded"
                disabled={updating}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <span>
            {profile.username}{" "}
            <button
              onClick={handleEdit}
              className="ml-2 text-blue-500 hover:underline"
            >
              Change
            </button>
          </span>
        )}
      </div>

      {/* Joined Date */}
      <div className="mb-4">
        <strong>Joined:</strong>{" "}
        {new Date(profile.created_at).toLocaleDateString()}
      </div>

      {/* Clubs Created */}
      <div className="mb-4">
        <strong>Clubs Created:</strong>
        {clubsError && <p className="text-red-500">{clubsError}</p>}
        {createdClubs.length === 0 ? (
          <p className="text-gray-600">You haven't created any clubs yet.</p>
        ) : (
          <ul className="mt-2 list-disc list-inside">
            {createdClubs.map((club) => (
              <li
                key={club.unique_id}
                className="text-gray-600 cursor-pointer hover:underline"
                onClick={() => navigate(`/clubs/${club.unique_id}`)}
              >
                {club.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Profile;
