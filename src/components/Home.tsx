// src/components/Home.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Club } from "../types/club";

const Home: React.FC = () => {
  const { token } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState<Boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
      setError("Failed to fetch your clubs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMemberClubs();
    }
  }, [token]);

  if (loading) {
    return <div>Loading your clubs...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
      <h2
        className="text-2xl font-bold mb-4 cursor-pointer"
        onClick={() => navigate("/clubs")}
      >
        Your Clubs
      </h2>
      {clubs.length === 0 ? (
        <p>You are not part of any clubs yet.</p>
      ) : (
        <ul className="space-y-2">
          {clubs.map((club) => (
            <li key={club.unique_id} className="p-4 bg-gray-100 rounded">
              <Link
                to={`/clubs/${club.unique_id}`}
                className="text-blue-500 hover:underline"
              >
                {club.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default Home;
