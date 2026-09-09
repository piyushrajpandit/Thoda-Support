"use client"
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CreatorsPage() {
  const [creators, setCreators] = useState([]);

  useEffect(() => {
    fetch("/api/creators")
      .then(res => res.json())
      .then(data => setCreators(data.creators));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-12">
      <h1 className="text-3xl font-bold text-center mb-10">All Creators</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
        {creators.map((creator) => (
          <Link href={`/${encodeURIComponent(creator.username)}`} key={creator.username}>
            <div className="flex flex-col items-center bg-gray-900 rounded-xl p-4 hover:bg-gray-800 transition cursor-pointer">
              <img
                src={creator.profilepic || "/default-avatar.png"}
                alt={creator.username}
                className="w-16 h-16 rounded-full object-cover mb-3"
                onError={(e) => e.target.src = "https://api.dicebear.com/7.x/initials/svg?seed=" + creator.username}
              />
              <p className="text-sm font-semibold text-center">{creator.name || creator.username}</p>
              <p className="text-xs text-gray-400 text-center">@{creator.username}</p>
            </div>
          </Link>
        ))}
        {creators.length === 0 && (
          <div className="col-span-full text-center py-10 px-6 bg-gray-900/60 rounded-xl border border-gray-800 my-4 max-w-lg mx-auto">
            <p className="text-gray-300 font-medium mb-2">No creators found yet.</p>
            <p className="text-xs text-yellow-400/90 leading-relaxed">
              💡 <strong>Reminder:</strong> If you already have creators registered, your MongoDB Atlas Free Tier cluster might be paused due to inactivity. Check your MongoDB Atlas Dashboard to resume the cluster or verify your database connection string in Vercel settings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}