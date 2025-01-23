// src/components/Clubs.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Club } from "../types/club";
import { Link } from "react-router-dom";
import { useClipboard } from "../hooks/useClipBoard";

const Clubs: React.FC = () => {
  // custom states
  const { token } = useAuth();
  const { copy, copiedValue } = useClipboard();

  // state for clubs
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // state for creating/joining clubs
  const [creating, setCreating] = useState<boolean>(false);
  const [clubName, setClubName] = useState<string>("");
  const [joinId, setJoinId] = useState<string>("");
  const [joinError, setJoinError] = useState<string | null>(null);

  // fetch clubs
  const fetchMemberClubs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/clubs`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setClubs(response.data);
    } catch (err) {
      console.log("Error fetching member clubs:", err);
      setError("Failed to fetch your clubs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMemberClubs();
    }
  }, [token]);

  // handle create club
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
      alert("Club created. Unique ID: " + response.data.unique_id);
      setClubName("");
      fetchMemberClubs();
    } catch (err) {
      console.error("Failed to create club:", err);
      alert("Error creating club.");
    } finally {
      setCreating(false);
    }
  };

  // handle join club
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
      fetchMemberClubs();
    } catch (err: any) {
      console.error("Failed to join club:", err);
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setJoinError(err.response.data.error);
      } else {
        setJoinError("Failed to join club.");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow space-y-6">
      <h2 className="text-2xl font-bold">New Clubs</h2>
      {/* Create club section */}
      <form onSubmit={handleCreateClub} className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Enter new club name"
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
          placeholder="Enter club ID to join"
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

      <h2 className="text-2xl font-bold">Your Clubs</h2>
      {loading && <div>Loading your clubs...</div>}
      {error && <div className="text-red-500">{error}</div>}

      {!loading && !error && clubs.length === 0 && (
        <p className="text-gray-600">You are not part of any clubs yet.</p>
      )}

      {!loading && !error && clubs.length > 0 && (
        <ul className="space-y-2">
          {clubs.map((club) => (
            <li
              key={club.unique_id}
              className="p-4 bg-gray-100 rounded flex justify-between"
            >
              <div>
                <Link
                  to={`/clubs/${club.unique_id}`}
                  className="hover:underline"
                >
                  <p className="text-lg font-semibold">{club.name}</p>
                </Link>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-500">ID:</p>
                  <span className="text-sm text-gray-500">
                    {club.unique_id}
                  </span>
                  <button
                    onClick={() => copy(club.unique_id)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    aria-label={`Copy ${club.unique_id}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                  {copiedValue === club.unique_id && (
                    <span className="text-xs text-green-500">Copied!</span>
                  )}
                </div>
              </div>
              {/* Possibly place a 'Leave' or 'Delete' button here if needed */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Clubs;
