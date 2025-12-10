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
    origin: string;
    origin_place_name?: string;
    origin_lat?: number;
    origin_lng?: number;
    destination: string;
    destination_place_name?: string;
    destination_lat?: number;
    destination_lng?: number;
    is_round_trip: boolean;
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
            const activityExists = trip.activities.some(a => a.id === updatedActivity.id);
            let updatedActivities;

            if (activityExists) {
                updatedActivities = trip.activities.map(a =>
                    a.id === updatedActivity.id ? updatedActivity : a
                );
            } else {
                updatedActivities = [...trip.activities, updatedActivity];
            }

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

    const handleAddActivity = () => {
        setSelectedActivity(null);
        setIsModalOpen(true);
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
    const hasOriginCoordinates = trip.origin_lat !== null && trip.origin_lat !== undefined &&
        trip.origin_lng !== null && trip.origin_lng !== undefined;
    const destinationName = trip.destination_place_name || trip.destination;
    const originName = trip.origin_place_name || trip.origin || "Start";

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="container mx-auto py-8 px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">{trip.name}</h1>
                    <p className="text-gray-600 mt-2">
                        {originName} → {destinationName} • {trip.start_date} to {trip.end_date} {trip.is_round_trip && "(Round trip)"}
                    </p>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">

                    {/* Summary Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-2">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Summary</h2>
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
                        <h2 className="text-xl font-semibold mb-4 text-gray-900">Travelers</h2>
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
                                <h2 className="text-xl font-semibold text-gray-900">Destination Map</h2>
                                <p className="text-sm text-gray-600">{originName} → {destinationName}</p>
                            </div>
                            {(hasDestinationCoordinates || (trip.is_round_trip && hasOriginCoordinates)) && (
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
                                placeName={`${destinationName} (End)`}
                                secondary={hasOriginCoordinates ? {
                                    latitude: Number(trip.origin_lat),
                                    longitude: Number(trip.origin_lng),
                                    placeName: `${originName} (Start)`
                                } : null}
                                height={300}
                            />
                        ) : (
                            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-gray-600 bg-gray-50">
                                Add validated origin and destination to see them on the map.
                            </div>
                        )}
                    </div>

                    {/* Calendar Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900">📅 Trip Calendar</h2>
                        <TripCalendar
                            startDate={trip.start_date}
                            endDate={trip.end_date}
                            activities={trip.activities}
                            onDateClick={handleDateClick}
                        />
                    </div>

                    {/* Activities Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-3">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Itinerary & Activities</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            {trip.activities.map((activity) => (
                                <div
                                    key={activity.id}
                                    onClick={() => handleActivityClick(activity)}
                                    className="aspect-square border border-gray-200 rounded-xl p-3 hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between bg-white"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 uppercase font-medium tracking-wider">
                                                {activity.type}
                                            </span>
                                            {activity.status === 'completed' && (
                                                <span className="text-green-600">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                                    </svg>
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1 leading-tight">{activity.name}</h3>
                                        {activity.date && (
                                            <p className="text-xs text-gray-500">
                                                {new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                <span className="mx-1">•</span>
                                                {new Date(activity.date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                                            </p>
                                        )}
                                        {activity.notes && (
                                            <p className="text-[10px] text-gray-400 mt-1 line-clamp-2 italic">
                                                {activity.notes}
                                            </p>
                                        )}
                                    </div>
                                    {activity.location && (
                                        <p className="text-[10px] text-gray-500 truncate mt-1 flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 flex-shrink-0">
                                                <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.625a19.055 19.055 0 002.273 1.765c.311.193.571.337.757.433.092.047.171.085.23.114.03.015.051.026.066.033l.014.007.004.002.001.001zM10 12a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                            </svg>
                                            {activity.location}
                                        </p>
                                    )}
                                </div>
                            ))}

                            {/* Add Activity Card */}
                            <button
                                onClick={handleAddActivity}
                                className="aspect-square border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer flex flex-col items-center justify-center text-gray-400 hover:text-green-600 gap-2 group"
                            >
                                <div className="p-3 bg-gray-50 rounded-full group-hover:bg-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                </div>
                                <span className="font-medium text-sm">Add Activity</span>
                            </button>
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
                                <h3 className="text-lg font-semibold">{originName} → {destinationName}</h3>
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
                            placeName={`${destinationName} (End)`}
                            secondary={hasOriginCoordinates ? {
                                latitude: Number(trip.origin_lat),
                                longitude: Number(trip.origin_lng),
                                placeName: `${originName} (Start)`
                            } : null}
                            height={420}
                            zoom={12}
                        />
                    </div>
                </div>
            )}

            {/* Activity Modal */}
            <ActivityModal
                activity={selectedActivity}
                tripId={trip.id}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUpdate={handleActivityUpdate}
            />

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
