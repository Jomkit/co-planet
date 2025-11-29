"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navigation from "@/components/Navigation";

interface Trip {
    id: number;
    name: string;
    destination: string;
    start_date: string;
    end_date: string;
    summary: string;
    people: string[];
    activities: Activity[];
}

interface Activity {
    id: number;
    name: string;
    type: string;
    date: string;
    location: string;
    notes: string;
    status: string;
}

export default function TripDashboard() {
    const params = useParams();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/trips/${params.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setTrip(data);
                }
            } catch (error) {
                console.error("Error fetching trip:", error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchTrip();
        }
    }, [params.id]);

    if (loading) return <div>Loading...</div>;
    if (!trip) return <div>Trip not found</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="container mx-auto py-8 px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">{trip.name}</h1>
                    <p className="text-gray-600 mt-2">{trip.destination} • {trip.start_date} to {trip.end_date}</p>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">

                    {/* Summary Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-2">
                        <h2 className="text-xl font-semibold mb-4">Summary</h2>
                        <p className="text-gray-700">{trip.summary}</p>
                    </div>

                    {/* People Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold mb-4">Travelers</h2>
                        <div className="flex flex-wrap gap-2">
                            {trip.people.map((person, i) => (
                                <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                    {person}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Activities Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-3">
                        <h2 className="text-xl font-semibold mb-4">Itinerary & Activities</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {trip.activities.map((activity) => (
                                <div key={activity.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-medium text-gray-900">{activity.name}</h3>
                                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-md text-gray-600 uppercase">{activity.type}</span>
                                    </div>
                                    {activity.date && <p className="text-sm text-gray-500 mt-2">{new Date(activity.date).toLocaleDateString()}</p>}
                                    {activity.location && <p className="text-sm text-gray-500 mt-1">📍 {activity.location}</p>}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
