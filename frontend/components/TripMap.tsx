"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";

declare global {
    interface Window {
        mapboxgl?: any;
    }
}

async function loadMapbox(): Promise<any> {
    if (typeof window === "undefined") return null;
    if (window.mapboxgl) return window.mapboxgl;

    return import("mapbox-gl").then((module) => {
        window.mapboxgl = module.default ?? (module as unknown as typeof import("mapbox-gl"));
        return window.mapboxgl;
    });
}

interface SecondaryLocation {
    latitude: number;
    longitude: number;
    placeName?: string;
    label?: string;
}

interface TripMapProps {
    latitude: number;
    longitude: number;
    placeName?: string;
    secondary?: SecondaryLocation | null;
    zoom?: number;
    className?: string;
    height?: number | string;
}

export default function TripMap({ latitude, longitude, placeName, secondary, zoom = 11, className, height = 260 }: TripMapProps) {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const [mapError, setMapError] = useState<string | null>(null);
    const isMissingToken = !process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    useEffect(() => {
        if (!mapContainer.current) return;

        if (isMissingToken) return;

        let map: any = null;

        loadMapbox()
            .then((mapbox) => {
                if (!mapContainer.current || !mapbox) return;

                const mapboxgl = mapbox as any;
                mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

                const hasSecondary = secondary && typeof secondary.latitude === "number" && typeof secondary.longitude === "number";
                const initialCenter: [number, number] = hasSecondary
                    ? [(longitude + secondary!.longitude) / 2, (latitude + secondary!.latitude) / 2]
                    : [longitude, latitude];

                map = new mapboxgl.Map({
                    container: mapContainer.current,
                    style: "mapbox://styles/mapbox/streets-v11",
                    center: initialCenter,
                    zoom
                });

                const primaryMarker = new mapboxgl.Marker({ color: "#16a34a" }).setLngLat([longitude, latitude]);

                if (placeName) {
                    const popup = new mapboxgl.Popup({ offset: 25 }).setText(placeName);
                    primaryMarker.setPopup(popup);
                }

                primaryMarker.addTo(map);

                if (hasSecondary) {
                    const secondaryMarker = new mapboxgl.Marker({ color: "#0ea5e9" }).setLngLat([secondary!.longitude, secondary!.latitude]);
                    if (secondary?.placeName || secondary?.label) {
                        const popup = new mapboxgl.Popup({ offset: 25 }).setText(secondary.label || secondary.placeName || "");
                        secondaryMarker.setPopup(popup);
                    }
                    secondaryMarker.addTo(map);

                    const bounds = new mapboxgl.LngLatBounds();
                    bounds.extend([longitude, latitude]);
                    bounds.extend([secondary!.longitude, secondary!.latitude]);
                    map?.fitBounds(bounds, { padding: 60, duration: 800 });
                }

                map?.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
            })
            .catch((error) => {
                console.error("Mapbox failed to load", error);
                setMapError("Unable to load map right now. Please try again later.");
            });

        return () => {
            map?.remove();
        };
    }, [latitude, longitude, placeName, secondary, zoom, isMissingToken]);

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

    return (
        <>
            <div
                ref={mapContainer}
                className={`trip-map-container w-full rounded-xl overflow-hidden ${className ?? ""}`}
                style={{ height }}
            />
            <style jsx global>{`
                .trip-map-container .mapboxgl-popup-content {
                    color: #111827; /* darken popup text for readability */
                }
            `}</style>
        </>
    );
}
