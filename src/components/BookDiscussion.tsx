// src/components/BookDiscussion.tsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import { Message } from "../types/message";
import { Book } from "../types/book";

interface BookDiscussionProps {
  book: Book;
  onClose: () => void;
}

const BookDiscussion: React.FC<BookDiscussionProps> = ({ book, onClose }) => {
  const { token, user } = useAuth();
  const socket = useSocket({ token });
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // fetch all existing messages
  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/books/${book.id}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  };

  // on component mount => fetch messages
  useEffect(() => {
    fetchMessages();
  }, [book.id]);

  // upon socket connection => join the book’s room
  useEffect(() => {
    if (!socket) return;

    // join the room for this book
    socket.emit("join_book", {
      token,
      book_id: book.id,
    });

    // listen for new messages
    socket.on("new_message", (msgData: Message) => {
      // if msg belongs to this book, add it
      if (msgData.book_id === book.id) {
        setMessages((prev) => [...prev, msgData]);
        scrollToBottom();
      }
    });

    // you could also handle "joined_room" or "error" events if you like.

    // cleanup => leave the room
    return () => {
      socket.emit("leave_book", {
        token,
        book_id: book.id,
      });
    };
  }, [socket, book.id, token]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/books/${book.id}/messages`,
        { content },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      // We rely on the "new_message" socket event to append it to the UI.
      setContent("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (!loading) {
      scrollToBottom();
    }
  }, [loading]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Modal backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Modal content */}
      <div className="relative bg-white rounded-lg shadow-md p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h3 className="text-xl font-bold mb-2">
          Discussion: {book.title} by {book.author}
        </h3>
        <div className="flex justify-end gap-2">
          <button
            onClick={scrollToTop}
            className="px-2 py-1 bg-gray-200 rounded text-sm"
          >
            Top
          </button>
          <button
            onClick={scrollToBottom}
            className="px-2 py-1 bg-gray-200 rounded text-sm"
          >
            Bottom
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {loading && <div>Loading messages...</div>}
          {!loading &&
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.user_id === user?.id ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                  className={`rounded px-3 py-2 ${msg.user_id === user?.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                    }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          <div ref={bottomRef}></div>
        </div>

        {/* Message input */}
        <form
          onSubmit={handleSend}
          className="mt-4 flex items-center space-x-2"
        >
          <input
            className="border rounded px-3 py-2 flex-grow"
            placeholder="Type your message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookDiscussion;
