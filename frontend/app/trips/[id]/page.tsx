"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import TripMap from "@/components/TripMap";
import ActivityModal from "@/components/ActivityModal";
import TripCalendar from "@/components/TripCalendar";
import DateDetailModal from "@/components/DateDetailModal";

interface Trip {
    id: number;
    name: string;
    destination: string;
    destination_place_name?: string;
    destination_lat?: number;
    destination_lng?: number;
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
    const [showExpandedMap, setShowExpandedMap] = useState(false);
    const params = useParams();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditingSummary, setIsEditingSummary] = useState(false);
    const [summaryText, setSummaryText] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [dateActivities, setDateActivities] = useState<Activity[]>([]);
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/trips/${params.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setTrip(data);
                    setSummaryText(data.summary || "");
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

    const handleActivityClick = (activity: Activity) => {
        setSelectedActivity(activity);
        setIsModalOpen(true);
    };

    const handleActivityUpdate = (updatedActivity: Activity) => {
        if (trip) {
            const updatedActivities = trip.activities.map(a =>
                a.id === updatedActivity.id ? updatedActivity : a
            );
            setTrip({ ...trip, activities: updatedActivities });
        }
        setIsModalOpen(false);
    };

    const handleSaveSummary = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/trips/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ summary: summaryText })
            });

            if (response.ok) {
                const updated = await response.json();
                setTrip(prev => prev ? { ...prev, summary: updated.summary } : null);
                setIsEditingSummary(false);
            }
        } catch (error) {
            console.error("Error updating summary:", error);
        }
    };

    const handleAddActivity = async () => {
        const activityName = prompt("Activity name:");
        if (!activityName?.trim()) return;

        try {
            const response = await fetch(`http://localhost:5000/api/trips/${params.id}/activities`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: activityName,
                    type: "excursion",
                    status: "planned"
                })
            });

            if (response.ok) {
                const newActivity = await response.json();
                setTrip(prev => prev ? {
                    ...prev,
                    activities: [...prev.activities, newActivity]
                } : null);
            }
        } catch (error) {
            console.error("Error adding activity:", error);
        }
    };

    const handleDateClick = (date: Date, activities: Activity[]) => {
        setSelectedDate(date);
        setDateActivities(activities);
        setIsDateModalOpen(true);
    };

    const handleAddActivityForDate = async (date: Date) => {
        const activityName = prompt("Activity name:");
        if (!activityName?.trim()) return;

        try {
            const response = await fetch(`http://localhost:5000/api/trips/${params.id}/activities`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: activityName,
                    type: "excursion",
                    status: "planned",
                    date: date.toISOString()
                })
            });

            if (response.ok) {
                const newActivity = await response.json();
                setTrip(prev => prev ? {
                    ...prev,
                    activities: [...prev.activities, newActivity]
                } : null);
            }
        } catch (error) {
            console.error("Error adding activity:", error);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!trip) return <div>Trip not found</div>;

    const hasDestinationCoordinates = trip.destination_lat !== null && trip.destination_lat !== undefined &&
        trip.destination_lng !== null && trip.destination_lng !== undefined;
    const destinationName = trip.destination_place_name || trip.destination;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="container mx-auto py-8 px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">{trip.name}</h1>
                    <p className="text-gray-600 mt-2">{destinationName} • {trip.start_date} to {trip.end_date}</p>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">

                    {/* Calendar Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-3">
                        <h2 className="text-xl font-semibold mb-4">📅 Trip Calendar</h2>
                        <TripCalendar
                            startDate={trip.start_date}
                            endDate={trip.end_date}
                            activities={trip.activities}
                            onDateClick={handleDateClick}
                        />
                    </div>

                    {/* Summary Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-2">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-semibold">Summary</h2>
                            {!isEditingSummary && (
                                <button
                                    onClick={() => setIsEditingSummary(true)}
                                    className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
                                    title="Edit summary"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        {isEditingSummary ? (
                            <div className="space-y-3">
                                <textarea
                                    value={summaryText}
                                    onChange={(e) => setSummaryText(e.target.value)}
                                    rows={4}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveSummary}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSummaryText(trip.summary || "");
                                            setIsEditingSummary(false);
                                        }}
                                        className="px-4 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-700">{trip.summary}</p>
                        )}
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

                    {/* Destination Map */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-semibold">Destination Map</h2>
                                <p className="text-sm text-gray-600">{destinationName}</p>
                            </div>
                            {hasDestinationCoordinates && (
                                <button
                                    type="button"
                                    onClick={() => setShowExpandedMap(true)}
                                    className="text-sm text-green-600 hover:text-green-500 font-medium"
                                >
                                    Expand
                                </button>
                            )}
                        </div>
                        {hasDestinationCoordinates ? (
                            <TripMap
                                latitude={Number(trip.destination_lat)}
                                longitude={Number(trip.destination_lng)}
                                placeName={destinationName}
                                height={300}
                            />
                        ) : (
                            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-gray-600 bg-gray-50">
                                Add a validated destination to see it on the map.
                            </div>
                        )}
                    </div>

                    {/* Activities Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-3">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Itinerary & Activities</h2>
                            <button
                                onClick={handleAddActivity}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                Add Activity
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {trip.activities.map((activity) => (
                                <div
                                    key={activity.id}
                                    onClick={() => handleActivityClick(activity)}
                                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                                >
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

            {/* Expanded Map Modal */}
            {showExpandedMap && hasDestinationCoordinates && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">{destinationName}</h3>
                                <p className="text-sm text-gray-600">Interactive map view</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowExpandedMap(false)}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                Close
                            </button>
                        </div>
                        <TripMap
                            latitude={Number(trip.destination_lat)}
                            longitude={Number(trip.destination_lng)}
                            placeName={destinationName}
                            height={420}
                            zoom={12}
                        />
                    </div>
                </div>
            )}

            {/* Activity Modal */}
            {selectedActivity && (
                <ActivityModal
                    activity={selectedActivity}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onUpdate={handleActivityUpdate}
                />
            )}

            {/* Date Detail Modal */}
            <DateDetailModal
                isOpen={isDateModalOpen}
                onClose={() => setIsDateModalOpen(false)}
                selectedDate={selectedDate}
                activities={dateActivities}
                onActivityClick={(activity) => {
                    setSelectedActivity(activity);
                    setIsModalOpen(true);
                    setIsDateModalOpen(false);
                }}
                onAddActivity={handleAddActivityForDate}
            />
        </div>
    );
}
