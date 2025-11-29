"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";

interface Trip {
    id: number;
    name: string;
    destination: string;
    start_date: string;
    end_date: string;
}

export default function TripsPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [newTripName, setNewTripName] = useState("");
    const router = useRouter();

    useEffect(() => {
        fetch("http://localhost:5000/api/trips")
            .then((res) => res.json())
            .then((data) => setTrips(data))
            .catch((err) => console.error("Error fetching trips:", err));
    }, []);

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTripName.trim()) {
            router.push(`/trips/create?name=${encodeURIComponent(newTripName)}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="container mx-auto py-10 px-4">
                <div className="max-w-4xl mx-auto space-y-10">

                    {/* Create New Trip Section */}
                    <div className="bg-gradient-to-r from-orange-100 to-amber-100 p-8 rounded-2xl shadow-sm border border-orange-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Plan a new adventure</h2>
                        <form onSubmit={handleCreateSubmit} className="flex gap-4">
                            <input
                                type="text"
                                value={newTripName}
                                onChange={(e) => setNewTripName(e.target.value)}
                                placeholder="Where to next?"
                                className="flex-1 rounded-full border-0 px-6 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-lg outline-none"
                            />
                            <button
                                type="submit"
                                className="rounded-full bg-green-600 px-6 py-3 text-white font-medium shadow-sm hover:bg-green-500 transition-colors"
                            >
                                Let's Go
                            </button>
                        </form>
                    </div>

                    {/* Trips List */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Trips</h1>
                        <div className="grid gap-6">
                            {trips.map((trip) => (
                                <Link key={trip.id} href={`/trips/${trip.id}`}>
                                    <div className="block bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900">{trip.name}</h3>
                                                <p className="text-gray-600 mt-1">{trip.destination}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                                                    {trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'Date TBD'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {trips.length === 0 && (
                                <p className="text-gray-500 text-center py-10">No trips yet. Start planning one above!</p>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
