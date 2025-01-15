// src/components/Clubs.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Club } from "../types/club";

const Clubs: React.FC = () => {
  const { token } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // create/join forms
  const [creating, setCreating] = useState<boolean>(false);
  const [clubName, setClubName] = useState<string>("");
  const [joinId, setJoinId] = useState<string>("");
  const [joinError, setJoinError] = useState<string | null>(null);

  // fetch clubs
  const fetchClubs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/clubs`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setClubs(response.data);
    } catch (err: any) {
      console.error("Failed to fetch clubs:", err);
      setError("Failed to load clubs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchClubs();
    }
  }, [token]);

  // create new club
  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubName.trim()) {
      alert("Please enter a club name");
      return;
    }
    try {
      setCreating(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/clubs`,
        { name: clubName },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Club created! Unique ID: " + response.data.unique_id);

      setClubName(""); // reset form
      fetchClubs(); // refresh list
    } catch (err: any) {
      console.error("Failed to create club:", err);
      alert("Error creating club.");
    } finally {
      setCreating(false);
    }
  };

  // join a club
  const handleJoinClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinId.trim()) {
      setJoinError("Please enter a valid club ID.");
      return;
    }

    try {
      setJoinError(null);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/clubs/${joinId}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Joined the club!");
      setJoinId("");
      // refresh list
      fetchClubs();
    } catch (err: any) {
      console.error("Failed to join club:", err);
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setJoinError(err.response.data.error);
      } else {
        setJoinError("Failed to join club.");
      }
    }
  };

  if (loading) {
    return <div>Loading clubs...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow space-y-6">
      <h2 className="text-2xl font-bold">New Clubs</h2>

      {/* Create club section */}
      <form onSubmit={handleCreateClub} className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Enter New Club Name"
          value={clubName}
          onChange={(e) => setClubName(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button
          type="submit"
          disabled={creating}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {creating ? "Creating..." : "Create New Club"}
        </button>
      </form>

      {/* Join club form */}
      <form onSubmit={handleJoinClub} className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Enter Club ID to join"
          value={joinId}
          onChange={(e) => setJoinId(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Join
        </button>
        {joinError && <p className="text-red-500 ml-4">{joinError}</p>}
      </form>

      {/* Club list */}
      <h2 className="text-2xl font-bold">Current Clubs</h2>
      {clubs.length === 0 ? (
        <p className="text-gray-600">You are not part of any clubs yet.</p>
      ) : (
        <ul className="space-y-2">
          {clubs.map((club) => (
            <li
              key={club.unique_id}
              className="p-4 bg-gray-100 rounded flex justify-between"
            >
              <div>
                <p>{club.name}</p>
              </div>
              {/* Link to detail/management page */}
              <Link
                to={`/clubs/${club.unique_id}`}
                className="px-3 py-2 bg-blue-200 text-blue-900 rounded"
              >
                Manage
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Clubs;
