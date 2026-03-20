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
          <Link href={`/${creator.username}`} key={creator.username}>
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
          <p className="col-span-full text-center text-gray-500">No creators yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}