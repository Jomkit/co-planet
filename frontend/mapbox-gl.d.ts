declare module "mapbox-gl" {
    export interface MapboxEvent {
        type: string;
    }

    export interface PopupOptions {
        offset?: number | number[];
    }

    export class Map {
        constructor(options: { container: string | HTMLElement; style: string; center: [number, number]; zoom?: number });
        remove(): void;
        addControl(control: unknown, position?: string): void;
    }

    export class Marker {
        constructor();
        setLngLat(lngLat: [number, number]): this;
        setPopup(popup: Popup): this;
        addTo(map: Map): this;
    }

    export class Popup {
        constructor(options?: PopupOptions);
        setText(text: string): this;
    }

    export class NavigationControl {
        constructor(options?: { visualizePitch?: boolean });
    }

    export let accessToken: string;
}
