// src/components/ClubDashboard.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { Member } from "../types/club";

const ClubDashboard: React.FC = () => {
  const { token, user } = useAuth();
  const { unique_id } = useParams(); // from the route /clubs/:unique_id
  const navigate = useNavigate();

  const [creatorId, setCreatorId] = useState<number | null>(null);
  const [creatorUsername, setCreatorUsername] = useState<string>("");
  const [clubName, setClubName] = useState<string>("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isCreator = creatorUsername === user?.username;

  // fetch members
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/clubs/${unique_id}/members`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setMembers(res.data.members);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch club details.");
    } finally {
      setLoading(false);
    }
  };

  // fetch club information
  const fetchClubInfo = async () => {
    try {
      setLoading(true);
      const clubRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/clubs/${unique_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      // response include { unique_id, creator_username, name, created_at }
      setCreatorId(clubRes.data.creator_id);
      setCreatorUsername(clubRes.data.creator_username);
      setClubName(clubRes.data.name);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch club details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchClubInfo();
      fetchMembers();
    }
  }, [token, unique_id]);

  // handle leaving club
  const handleLeave = async () => {
    if (!unique_id) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/clubs/${unique_id}/leave`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("You left the club.");
      navigate("/clubs");
    } catch (err) {
      alert("Could not leave club.");
    }
  };

  // handle delete club
  const handleDelete = async () => {
    if (!unique_id) return;
    if (!window.confirm("Are you sure you want to delete this club?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/clubs/${unique_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Club deleted.");
      navigate("/clubs");
    } catch (err) {
      alert("Could not delete club.");
    }
  };

  // handle ban user
  const handleBan = async (member: Member) => {
    if (!unique_id) return;
    if (!window.confirm(`Ban ${member.username}?`)) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/clubs/${unique_id}/ban`,
        { user_id: member.id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("User banned.");
      // re-fetch members
      fetchMembers();
    } catch (err) {
      alert("Could not ban user.");
    }
  };

  if (loading) {
    return <div>Loading club...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow space-y-6">
      <h2 className="text-2xl font-bold">{clubName}</h2>
      <p className="text-gray-600">Club ID: {unique_id}</p>
      <p className="text-gray-600">Creator: {creatorUsername}</p>
      <div className="flex space-x-2">
        {isCreator ? (
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Delete Club
          </button>
        ) : (
          <button
            onClick={handleLeave}
            className="px-4 py-2 bg-orange-500 text-white rounded"
          >
            Leave Club
          </button>
        )}
        <button
          onClick={() => navigate("/clubs")}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
        >
          Back to Clubs
        </button>
      </div>

      <div className="mt-4">
        <h3 className="text-xl font-semibold">Members</h3>
        {members.length === 0 ? (
          <p>No members (strange!).</p>
        ) : (
          <ul className="space-y-2 mt-2">
            {members.map((m) => (
              <li
                key={m.id}
                className="bg-gray-100 p-4 rounded flex justify-between items-center"
              >
                <span>{m.username}</span>
                {isCreator && m.id !== user?.id && (
                  <button
                    onClick={() => handleBan(m)}
                    className="px-3 py-1 bg-red-200 text-red-800 rounded"
                  >
                    Ban
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ClubDashboard;
