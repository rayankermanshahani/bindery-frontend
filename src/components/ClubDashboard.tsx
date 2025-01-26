// src/components/ClubDashboard.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Member } from "../types/club";
import { Book } from "../types/book";
import { useClipboard } from "../hooks/useClipBoard";
import ConfirmModal from "./ui/ConfirmModal";
import ClubBooks from "./ClubBooks";
import BookDiscussion from "./BookDiscussion";

const ClubDashboard: React.FC = () => {
  const navigate = useNavigate();
  // general state
  const { token, user } = useAuth();
  const { unique_id } = useParams();
  const { copy, copiedValue } = useClipboard();

  // club state
  const [creatorId, setCreatorId] = useState<number | null>(null);
  const [creatorUsername, setCreatorUsername] = useState<string>("");
  const [clubName, setClubName] = useState<string>("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // confirmation modals
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showBanModal, setShowBanModal] = useState<boolean>(false);
  const [memberToBan, setMemberToBan] = useState<Member | null>(null);

  const isCreator = creatorUsername === user?.username;

  // fetch members
  const fetchMembers = async () => {
    try {
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
    }
  };

  // fetch club information
  const fetchClubInfo = async () => {
    try {
      const clubRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/clubs/${unique_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
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

  const handleLeave = () => {
    setShowLeaveModal(true);
  };
  const confirmLeaveClub = async () => {
    setShowLeaveModal(false);
    if (!unique_id) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/clubs/${unique_id}/leave`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("You left the club");
      navigate("/clubs");
    } catch (err) {
      console.error(err);
      alert("Could not leave club");
    }
  };
  const cancelLeaveClub = () => setShowLeaveModal(false);

  const handleDelete = async () => setShowDeleteModal(true);
  const confirmDeleteClub = async () => {
    setShowDeleteModal(false);
    if (!unique_id) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/clubs/${unique_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Club deleted");
      navigate("/clubs");
    } catch (err) {
      console.error(err);
      alert("Could not delete club");
    }
  };
  const cancelDeleteClub = () => setShowDeleteModal(false);

  // handle user banning
  const handleBan = (member: Member) => {
    setMemberToBan(member);
    setShowBanModal(true);
  };
  const confirmBan = async () => {
    if (!unique_id || !memberToBan) return;
    setShowBanModal(false);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/clubs/${unique_id}/ban`,
        { user_id: memberToBan.id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert(`User ${memberToBan.username} has been banned`);
      setMemberToBan(null);
      fetchMembers();
    } catch (err) {
      console.error(err);
      alert("Could not ban user");
    }
  };
  const cancelBan = () => {
    setShowBanModal(false);
    setMemberToBan(null);
  };

  const onSelectBook = (book: Book) => {
    setSelectedBook(book);
  };

  const closeDiscussion = () => {
    setSelectedBook(null);
  };

  if (loading) return <div>Loading club...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow space-y-6">
      <h2 className="text-2xl font-bold">{clubName}</h2>
      <p className="text-gray-600">Creator: {creatorUsername}</p>
      <div className="flex items-center gap-2">
        <p className="text-sm text-gray-500">ID:</p>
        <span className="text-sm text-gray-500">{unique_id}</span>
        <button
          onClick={() => copy(unique_id!)}
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
          aria-label={`Copy ${unique_id}`}
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
        {copiedValue === unique_id && (
          <span className="text-xs text-green-500">Copied!</span>
        )}
      </div>

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

      {/* Show the membership list */}
      <div className="mt-4">
        <h3 className="text-xl font-semibold">Members</h3>
        {members.length === 0 ? (
          <p>No members yet.</p>
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

      {/* Show the books section */}
      <ClubBooks isCreator={isCreator} onSelectBook={onSelectBook} />

      {/* Confirmation modals for leaving, deleting, banning */}
      <ConfirmModal
        show={showLeaveModal}
        title="Leave Club"
        message="Are you sure you want to leave this club?"
        onConfirm={confirmLeaveClub}
        onCancel={cancelLeaveClub}
      />
      <ConfirmModal
        show={showDeleteModal}
        title="Delete Club"
        message="Are you sure you want to delete this club?"
        onConfirm={confirmDeleteClub}
        onCancel={cancelDeleteClub}
      />
      <ConfirmModal
        show={showBanModal}
        title="Ban Member"
        message={
          memberToBan
            ? `Are you sure you want to ban ${memberToBan.username}?`
            : "Are you sure you want to ban this member?"
        }
        onConfirm={confirmBan}
        onCancel={cancelBan}
      />

      {/* Book discussion modal, if we have a selectedBook */}
      {selectedBook && (
        <BookDiscussion book={selectedBook} onClose={closeDiscussion} />
      )}
    </div>
  );
};

export default ClubDashboard;
