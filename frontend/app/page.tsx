"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [tripName, setTripName] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tripName.trim()) {
      router.push(`/trips/create?name=${encodeURIComponent(tripName)}`);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-orange-100 to-amber-200 p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Co-Planet
        </h1>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-medium text-gray-800">
            what&apos;s our next trip?
          </h2>
          
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              placeholder="Road Trip to Cali..."
              className="flex-1 rounded-full border-0 px-6 py-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-lg sm:leading-6 outline-none"
              required
            />
            <button
              type="submit"
              className="rounded-full bg-green-600 p-4 text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
