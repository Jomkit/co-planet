"use client";

import { useEffect, useRef, useState } from "react";

declare global {
    interface Window {
        mapboxgl?: typeof import("mapbox-gl");
    }
}

const MAPBOX_SCRIPT = "https://api.mapbox.com/mapbox-gl-js/v2.16.1/mapbox-gl.js";
const MAPBOX_STYLES = "https://api.mapbox.com/mapbox-gl-js/v2.16.1/mapbox-gl.css";

async function loadMapbox(): Promise<typeof import("mapbox-gl") | null> {
    if (typeof window === "undefined") return null;
    if (window.mapboxgl) return window.mapboxgl;

    await Promise.all([
        new Promise<void>((resolve, reject) => {
            const existingScript = document.querySelector(`script[src="${MAPBOX_SCRIPT}"]`);
            if (existingScript) {
                existingScript.addEventListener("load", () => resolve());
                existingScript.addEventListener("error", () => reject(new Error("Failed to load Mapbox script")));
                return;
            }
            const script = document.createElement("script");
            script.src = MAPBOX_SCRIPT;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load Mapbox script"));
            document.head.appendChild(script);
        }),
        new Promise<void>((resolve, reject) => {
            const existingLink = document.querySelector(`link[href="${MAPBOX_STYLES}"]`);
            if (existingLink) return resolve();
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = MAPBOX_STYLES;
            link.onload = () => resolve();
            link.onerror = () => reject(new Error("Failed to load Mapbox styles"));
            document.head.appendChild(link);
        })
    ]);

    return window.mapboxgl || null;
}

interface TripMapProps {
    latitude: number;
    longitude: number;
    placeName?: string;
    zoom?: number;
    className?: string;
    height?: number | string;
}

export default function TripMap({ latitude, longitude, placeName, zoom = 11, className, height = 260 }: TripMapProps) {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const [mapError, setMapError] = useState<string | null>(null);
    const isMissingToken = !process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    useEffect(() => {
        if (!mapContainer.current) return;

        if (isMissingToken) return;

        let map: import("mapbox-gl").Map | null = null;

        loadMapbox()
            .then((mapbox) => {
                if (!mapContainer.current || !mapbox) return;

                mapbox.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

                map = new mapbox.Map({
                    container: mapContainer.current,
                    style: "mapbox://styles/mapbox/streets-v11",
                    center: [longitude, latitude],
                    zoom
                });

                const marker = new mapbox.Marker().setLngLat([longitude, latitude]);

                if (placeName) {
                    const popup = new mapbox.Popup({ offset: 25 }).setText(placeName);
                    marker.setPopup(popup);
                }

                marker.addTo(map);
                map.addControl(new mapbox.NavigationControl({ visualizePitch: true }), "top-right");
            })
            .catch((error) => {
                console.error("Mapbox failed to load", error);
                setMapError("Unable to load map right now. Please try again later.");
            });

        return () => {
            map?.remove();
        };
    }, [latitude, longitude, placeName, zoom, isMissingToken]);

    if (mapError || isMissingToken) {
        return (
            <div
                className={`flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 ${className ?? ""}`}
                style={{ height }}
            >
                {mapError || "Map unavailable: set NEXT_PUBLIC_MAPBOX_TOKEN"}
            </div>
        );
    }

    return <div ref={mapContainer} className={`w-full rounded-xl overflow-hidden ${className ?? ""}`} style={{ height }} />;
}
