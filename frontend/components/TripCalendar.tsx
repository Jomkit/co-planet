"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface Activity {
    id: number;
    name: string;
    type: string;
    date: string;
    location: string;
    notes: string;
    status: string;
}

interface TripCalendarProps {
    startDate: string;
    endDate: string;
    activities: Activity[];
    onDateClick: (date: Date, activities: Activity[]) => void;
}

export default function TripCalendar({ startDate, endDate, activities, onDateClick }: TripCalendarProps) {
    // Parse dates and normalize to midnight to avoid timezone issues
    const tripStart = new Date(startDate + 'T00:00:00');
    const tripEnd = new Date(endDate + 'T00:00:00');

    // Default to trip start month
    const [activeStartDate, setActiveStartDate] = useState(tripStart);

    // Helper to check if date is within trip range
    const isInTripRange = (date: Date): boolean => {
        // Normalize all dates to midnight for comparison
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const startOnly = new Date(tripStart.getFullYear(), tripStart.getMonth(), tripStart.getDate());
        const endOnly = new Date(tripEnd.getFullYear(), tripEnd.getMonth(), tripEnd.getDate());
        return dateOnly >= startOnly && dateOnly <= endOnly;
    };

    // Helper to get activities for a specific date
    const getActivitiesForDate = (date: Date): Activity[] => {
        return activities.filter(activity => {
            if (!activity.date) return false;
            const activityDate = new Date(activity.date);
            return (
                activityDate.getFullYear() === date.getFullYear() &&
                activityDate.getMonth() === date.getMonth() &&
                activityDate.getDate() === date.getDate()
            );
        });
    };

    // Custom tile content to show activity indicators
    const tileContent = ({ date }: { date: Date }) => {
        const dateActivities = getActivitiesForDate(date);
        if (dateActivities.length > 0) {
            return (
                <div className="flex justify-center mt-1">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                </div>
            );
        }
        return null;
    };

    // Custom tile class names for styling
    const tileClassName = ({ date }: { date: Date }) => {
        const classes = [];

        if (isInTripRange(date)) {
            classes.push("trip-date");
        }

        return classes.join(" ");
    };

    const handleDateClick = (value: Date) => {
        const dateActivities = getActivitiesForDate(value);
        onDateClick(value, dateActivities);
    };

    return (
        <div className="trip-calendar-wrapper">
            <Calendar
                value={tripStart}
                activeStartDate={activeStartDate}
                onActiveStartDateChange={({ activeStartDate }) =>
                    activeStartDate && setActiveStartDate(activeStartDate)
                }
                onClickDay={handleDateClick}
                tileContent={tileContent}
                tileClassName={tileClassName}
                minDetail="month"
                className="custom-calendar"
            />
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-100 border border-green-300 rounded"></div>
                    <span>Trip dates</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                    <span>Has activities</span>
                </div>
            </div>
        </div>
    );
}
