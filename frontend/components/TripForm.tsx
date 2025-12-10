"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DestinationSearch, { DestinationOption } from "./DestinationSearch";

interface Activity {
    name: string;
    type: string;
    date?: string;
    location?: string;
    notes?: string;
    status?: string;
}

export default function TripForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState({
        name: "",
        start_date: "",
        end_date: "",
        summary: "",
        people: "",
        is_round_trip: false,
        activities: [] as Activity[]
    });
    const [origin, setOrigin] = useState<DestinationOption | null>(null);
    const [destination, setDestination] = useState<DestinationOption | null>(null);

    useEffect(() => {
        const nameParam = searchParams.get("name");
        if (nameParam) {
            setFormData(prev => ({ ...prev, name: nameParam }));
        }
    }, [searchParams]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addActivity = () => {
        setFormData(prev => ({
            ...prev,
            activities: [...prev.activities, { name: "", type: "excursion", status: "planned", date: "", location: "", notes: "" }]
        }));
    };

    const updateActivity = (index: number, field: keyof Activity, value: string) => {
        const newActivities = [...formData.activities];
        newActivities[index] = { ...newActivities[index], [field]: value };
        setFormData(prev => ({ ...prev, activities: newActivities }));
    };

    const removeActivity = (index: number) => {
        setFormData(prev => ({
            ...prev,
            activities: prev.activities.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (!origin) {
                alert("Please select a start location from the suggestions to continue.");
                return;
            }

            const finalDestination = destination || (formData.is_round_trip ? origin : null);

            if (!finalDestination) {
                alert("Please select an end destination from the suggestions to continue.");
                return;
            }

            // 1. Create Trip with validated destination
            const tripResponse = await fetch("http://localhost:5000/api/trips", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    origin: origin.place_name,
                    origin_place_name: origin.place_name,
                    origin_lat: origin.latitude,
                    origin_lng: origin.longitude,
                    origin_mapbox_id: origin.id,
                    destination: finalDestination.place_name,
                    destination_place_name: finalDestination.place_name,
                    destination_lat: finalDestination.latitude,
                    destination_lng: finalDestination.longitude,
                    destination_mapbox_id: finalDestination.id,
                    is_round_trip: formData.is_round_trip,
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    summary: formData.summary,
                    people: formData.people.split(",").map(p => p.trim()).filter(Boolean)
                })
            });

            if (!tripResponse.ok) {
                const errorPayload = await tripResponse.json().catch(() => ({}));
                const message = errorPayload.error || errorPayload.details || "Failed to create trip";
                throw new Error(message);
            }

            const trip = await tripResponse.json();

            // 2. Create Activities
            for (const activity of formData.activities) {
                if (activity.name) {
                    const activityResponse = await fetch(`http://localhost:5000/api/trips/${trip.id}/activities`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            name: activity.name,
                            type: activity.type,
                            date: activity.date || undefined,
                            location: activity.location || undefined,
                            notes: activity.notes || undefined,
                            status: activity.status || "planned"
                        })
                    });

                    if (!activityResponse.ok) {
                        const errorPayload = await activityResponse.json().catch(() => ({}));
                        const message = errorPayload.error || errorPayload.details || "Failed to create activity";
                        throw new Error(message);
                    }
                }
            }

            router.push(`/trips/${trip.id}`);
        } catch (error) {
            console.error("Error creating trip:", error);
            alert((error as Error).message || "Failed to create trip. Please try again.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            {/* Basic Info */}
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Trip Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border text-gray-900"
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <DestinationSearch
                        required
                        value={origin}
                        onChange={(option) => {
                            setOrigin(option);
                            if (formData.is_round_trip && !destination) {
                                setDestination(option);
                            }
                        }}
                        label="Start Location"
                    />
                    <DestinationSearch
                        required={!formData.is_round_trip}
                        value={destination}
                        onChange={setDestination}
                        label="End Destination"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <input
                        id="is_round_trip"
                        type="checkbox"
                        checked={formData.is_round_trip}
                        onChange={(e) => {
                            const next = e.target.checked;
                            setFormData(prev => ({ ...prev, is_round_trip: next }));
                            if (next && origin && !destination) {
                                setDestination(origin);
                            }
                        }}
                        className="h-4 w-4 text-green-600 border-gray-300 rounded"
                    />
                    <label htmlFor="is_round_trip" className="text-sm text-gray-700">
                        Round trip (end destination defaults to start location)
                    </label>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input
                            type="date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">End Date</label>
                        <input
                            type="date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border text-gray-900"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Who&apos;s going? (comma separated)</label>
                    <input
                        type="text"
                        name="people"
                        value={formData.people}
                        onChange={handleInputChange}
                        placeholder="Me, John, Jane"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border text-gray-900"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Summary</label>
                    <textarea
                        name="summary"
                        rows={3}
                        value={formData.summary}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border text-gray-900"
                    />
                </div>
            </div>

            {/* Activities */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Planned Activities</h3>
                    <button
                        type="button"
                        onClick={addActivity}
                        className="text-sm text-green-600 hover:text-green-500 font-medium"
                    >
                        + Add Activity
                    </button>
                </div>

                {formData.activities.map((activity, index) => (
                    <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg">
                        <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Activity Name"
                                    value={activity.name}
                                    onChange={(e) => updateActivity(index, "name", e.target.value)}
                                    required
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border text-gray-900"
                                />
                                <select
                                    value={activity.type}
                                    onChange={(e) => updateActivity(index, "type", e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border text-gray-900"
                                >
                                    <option value="excursion">Excursion</option>
                                    <option value="restaurant">Restaurant</option>
                                    <option value="flight">Flight</option>
                                    <option value="lodging">Lodging</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input
                                    type="datetime-local"
                                    value={activity.date || ""}
                                    onChange={(e) => updateActivity(index, "date", e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border text-gray-900"
                                />
                                <select
                                    value={activity.status || "planned"}
                                    onChange={(e) => updateActivity(index, "status", e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border text-gray-900"
                                >
                                    <option value="planned">Planned</option>
                                    <option value="booked">Booked</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <input
                                type="text"
                                placeholder="Location or venue"
                                value={activity.location || ""}
                                onChange={(e) => updateActivity(index, "location", e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border text-gray-900"
                            />
                            <textarea
                                placeholder="Notes or details"
                                value={activity.notes || ""}
                                onChange={(e) => updateActivity(index, "notes", e.target.value)}
                                rows={3}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border text-gray-900"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => removeActivity(index)}
                            className="text-red-500 hover:text-red-700"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    Create Trip
                </button>
            </div>
        </form>
    );
}
