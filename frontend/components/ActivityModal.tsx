"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";

interface Activity {
    id: number;
    name: string;
    type: string;
    date: string;
    location: string;
    notes: string;
    status: string;
}

interface ActivityModalProps {
    activity?: Activity | null;
    tripId?: number;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (activity: Activity) => void;
}

export default function ActivityModal({ activity, tripId, isOpen, onClose, onUpdate }: ActivityModalProps) {
    const isCreating = !activity;
    const [isEditing, setIsEditing] = useState(isCreating);

    const initialFormState = {
        id: 0,
        name: "",
        type: "excursion",
        date: "",
        location: "",
        notes: "",
        status: "planned"
    };

    const [formData, setFormData] = useState<Activity>(activity || initialFormState);

    useEffect(() => {
        if (isOpen) {
            if (activity) {
                setFormData(activity);
                setIsEditing(false);
            } else {
                setFormData(initialFormState);
                setIsEditing(true);
            }
        }
    }, [activity, isOpen]);

    const handleSave = async () => {
        try {
            const url = isCreating
                ? `http://localhost:5000/api/trips/${tripId}/activities`
                : `http://localhost:5000/api/activities/${activity?.id}`;

            const method = isCreating ? "POST" : "PUT";

            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const updated = await response.json();
                onUpdate(updated);
                if (isCreating) {
                    onClose();
                } else {
                    setIsEditing(false);
                }
            }
        } catch (error) {
            console.error("Error saving activity:", error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {isCreating ? "Add New Activity" : "Activity Details"}
                </h2>
                <div className="flex gap-2">
                    {!isCreating && !isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                            title="Edit activity"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="e.g., Dinner at Mario's"
                        />
                    ) : (
                        <p className="text-gray-900">{activity?.name}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    {isEditing ? (
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="excursion">Excursion</option>
                            <option value="restaurant">Restaurant</option>
                            <option value="flight">Flight</option>
                            <option value="lodging">Lodging</option>
                        </select>
                    ) : (
                        <p className="text-gray-900 capitalize">{activity?.type}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    {isEditing ? (
                        <input
                            type="datetime-local"
                            value={formData.date ? new Date(formData.date).toISOString().slice(0, 16) : ""}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                    ) : (
                        <p className="text-gray-900">{activity?.date ? new Date(activity.date).toLocaleString() : "Not set"}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={formData.location || ""}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="e.g., 123 Main St"
                        />
                    ) : (
                        <p className="text-gray-900">{activity?.location || "Not specified"}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    {isEditing ? (
                        <textarea
                            value={formData.notes || ""}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={4}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Add any details here..."
                        />
                    ) : (
                        <p className="text-gray-900">{activity?.notes || "No notes"}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    {isEditing ? (
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="planned">Planned</option>
                            <option value="booked">Booked</option>
                            <option value="completed">Completed</option>
                        </select>
                    ) : (
                        <p className="text-gray-900 capitalize">{activity?.status}</p>
                    )}
                </div>
            </div>

            {isEditing && (
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleSave}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                        {isCreating ? "Create Activity" : "Save Changes"}
                    </button>
                    <button
                        onClick={() => {
                            if (isCreating) {
                                onClose();
                            } else {
                                setFormData(activity!);
                                setIsEditing(false);
                            }
                        }}
                        className="flex-1 bg-gray-200 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </Modal>
    );
}
