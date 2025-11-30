"use client";

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

interface DateDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date | null;
    activities: Activity[];
    onActivityClick: (activity: Activity) => void;
    onAddActivity: (date: Date) => void;
}

export default function DateDetailModal({
    isOpen,
    onClose,
    selectedDate,
    activities,
    onActivityClick,
    onAddActivity
}: DateDetailModalProps) {
    if (!selectedDate) return null;

    const formattedDate = selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{formattedDate}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {activities.length} {activities.length === 1 ? "activity" : "activities"}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="space-y-3 mb-6">
                {activities.length > 0 ? (
                    activities.map((activity) => (
                        <div
                            key={activity.id}
                            onClick={() => onActivityClick(activity)}
                            className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                        >
                            <div className="flex justify-between items-start">
                                <h3 className="font-medium text-gray-900">{activity.name}</h3>
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded-md text-gray-600 uppercase">
                                    {activity.type}
                                </span>
                            </div>
                            {activity.date && (
                                <p className="text-sm text-gray-500 mt-2">
                                    {new Date(activity.date).toLocaleTimeString("en-US", {
                                        hour: "numeric",
                                        minute: "2-digit"
                                    })}
                                </p>
                            )}
                            {activity.location && (
                                <p className="text-sm text-gray-500 mt-1">📍 {activity.location}</p>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-2 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        <p>No activities scheduled for this date</p>
                    </div>
                )}
            </div>

            <button
                onClick={() => {
                    onAddActivity(selectedDate);
                    onClose();
                }}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Activity for This Date
            </button>
        </Modal>
    );
}
