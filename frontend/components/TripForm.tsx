"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Activity {
    name: string;
    type: string;
}

export default function TripForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState({
        name: "",
        destination: "",
        start_date: "",
        end_date: "",
        summary: "",
        people: "",
        activities: [] as Activity[]
    });

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
            activities: [...prev.activities, { name: "", type: "excursion" }]
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
            // 1. Create Trip
            const tripResponse = await fetch("http://localhost:5000/api/trips", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    destination: formData.destination,
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    summary: formData.summary,
                    people: formData.people.split(",").map(p => p.trim()).filter(Boolean)
                })
            });

            if (!tripResponse.ok) throw new Error("Failed to create trip");

            const trip = await tripResponse.json();

            // 2. Create Activities
            for (const activity of formData.activities) {
                if (activity.name) {
                    await fetch(`http://localhost:5000/api/trips/${trip.id}/activities`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(activity)
                    });
                }
            }

            router.push(`/trips/${trip.id}`);
        } catch (error) {
            console.error("Error creating trip:", error);
            alert("Failed to create trip. Please try again.");
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

                <div>
                    <label className="block text-sm font-medium text-gray-700">Destination(s)</label>
                    <input
                        type="text"
                        name="destination"
                        value={formData.destination}
                        onChange={handleInputChange}
                        placeholder="e.g. California, Nevada, Arizona"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border text-gray-900"
                    />
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
                    <label className="block text-sm font-medium text-gray-700">Who's going? (comma separated)</label>
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
                            <input
                                type="text"
                                placeholder="Activity Name"
                                value={activity.name}
                                onChange={(e) => updateActivity(index, "name", e.target.value)}
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
