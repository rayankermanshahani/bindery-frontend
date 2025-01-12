// src/components/Profile.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { User } from "../types/auth";

const Profile: React.FC = () => {
  const { token, setUser } = useAuth(); // Use setUser instead of login
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
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

        // Update the AuthContext with the latest user data
        setUser(fetchedUser);
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError("Failed to fetch profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, setUser]);

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
      <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
      <p>
        <strong>ID:</strong> {profile.id}
      </p>
      <p>
        <strong>Username:</strong> {profile.username}
      </p>
      <p>
        <strong>Joined:</strong> {new Date(profile.created_at).toLocaleString()}
      </p>
    </div>
  );
};

export default Profile;
