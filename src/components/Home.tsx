// src/components/Home.tsx
import React from "react";

const Home: React.FC = () => {
  // TODO: remove placeholder data for user's clubs
  const clubs = [
    { id: 1, name: "Book Lovers" },
    { id: 2, name: "Sci-Fi Enthusiasts" },
    { id: 3, name: "Mystery Fans" },
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Your Clubs</h2>
      {clubs.length === 0 ? (
        <p>You are not part of any clubs yet.</p>
      ) : (
        <ul className="space-y-2">
          {clubs.map((club) => (
            <li key={club.id} className="p-4 bg-gray-100 rounded">
              {club.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Home;
