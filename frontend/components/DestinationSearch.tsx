"use client";

import { useEffect, useMemo, useState } from "react";

export interface DestinationOption {
    id: string;
    place_name: string;
    text?: string;
    latitude: number;
    longitude: number;
}

interface DestinationSearchProps {
    label?: string;
    value: DestinationOption | null;
    onChange: (option: DestinationOption | null) => void;
    required?: boolean;
}

const API_BASE = "http://localhost:5000";

export default function DestinationSearch({ label = "Destination", value, onChange, required }: DestinationSearchProps) {
    const [query, setQuery] = useState(value?.place_name ?? "");
    const [results, setResults] = useState<DestinationOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const debouncedQuery = useMemo(() => query.trim(), [query]);

    useEffect(() => {
        if (debouncedQuery.length < 3) {
            setResults([]);
            setError(null);
            return;
        }

        const controller = new AbortController();
        setLoading(true);
        setError(null);

        const fetchPlaces = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/places/search?query=${encodeURIComponent(debouncedQuery)}`, {
                    signal: controller.signal
                });

                if (!response.ok) {
                    const errorPayload = await response.json().catch(() => ({}));
                    throw new Error(errorPayload.error || "Unable to fetch places");
                }

                const data = await response.json();
                setResults(data.features || []);
            } catch (err) {
                if ((err as Error).name === "AbortError") return;
                setError((err as Error).message);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        const timeout = setTimeout(fetchPlaces, 250);
        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [debouncedQuery]);

    const handleSelect = (option: DestinationOption) => {
        setQuery(option.place_name);
        onChange(option);
        setResults([]);
    };

    const handleInputChange = (nextValue: string) => {
        setQuery(nextValue);
        onChange(null);
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="Search for a city, region, or place"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border text-gray-900"
                    required={required}
                    aria-autocomplete="list"
                />
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">Searching…</div>
                )}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {results.length > 0 && (
                <ul className="border border-gray-200 rounded-md divide-y divide-gray-200 bg-white shadow-sm">
                    {results.map((option) => (
                        <li
                            key={option.id}
                            className="p-2 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleSelect(option)}
                        >
                            <p className="font-medium text-gray-900">{option.text || option.place_name}</p>
                            <p className="text-xs text-gray-600">{option.place_name}</p>
                        </li>
                    ))}
                </ul>
            )}
            {value && !results.length && !loading && !error && (
                <p className="text-xs text-gray-500">Selected: {value.place_name}</p>
            )}
        </div>
    );
}
