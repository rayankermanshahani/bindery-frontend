// src/components/ClubBooks.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Book } from "../types/book";
import { useParams } from "react-router-dom";

interface ClubBooksProps {
  isCreator: boolean;
  onSelectBook: (book: Book) => void;
}

const ClubBooks: React.FC<ClubBooksProps> = ({ isCreator, onSelectBook }) => {
  const { token } = useAuth();
  const { unique_id } = useParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [adding, setAdding] = useState<boolean>(false);

  // fetch books
  const fetchBooks = async () => {
    if (!unique_id) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/clubs/${unique_id}/books`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setBooks(res.data);
    } catch (err: any) {
      console.error("Failed to fetch books:", err);
      setError("Could not fetch books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [unique_id, token]);

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      alert("Please fill in both title and author");
      return;
    }
    try {
      setAdding(true);
      setError(null);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/clubs/${unique_id}/books`,
        { title, author },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // flush out state and refresh list of book
      setTitle("");
      setAuthor("");
      fetchBooks();
    } catch (err: any) {
      console.error("Failed to add book:", err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to add book");
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">Books</h2>

      {/* Only show if user is club creator */}
      {isCreator && (
        <form
          onSubmit={handleAddBook}
          className="flex flex-col md:flex-row items-center gap-2 mb-4"
        >
          <input
            className="border px-2 py-1 rounded"
            placeholder="Book Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="border px-2 py-1 rounded"
            placeholder="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded"
            disabled={adding}
          >
            {adding ? "Adding..." : "Add Book"}
          </button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      )}

      {loading && <p>Loading books...</p>}
      {!loading && books.length === 0 && (
        <p className="text-gray-600">No books in this club yet.</p>
      )}
      {!loading &&
        books.map((book) => (
          <div
            key={book.id}
            className="p-4 mb-2 bg-gray-100 rounded flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{book.title}</p>
              <p className="text-sm text-gray-600">{book.author}</p>
            </div>
            <button
              onClick={() => onSelectBook(book)}
              className="px-3 py-1 bg-green-500 text-white rounded"
            >
              Open Discussion
            </button>
          </div>
        ))}
    </div>
  );
};

export default ClubBooks;
