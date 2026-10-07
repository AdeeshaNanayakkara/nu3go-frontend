"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Compass, Loader2 } from "lucide-react";

interface OpenStreetMapPickerProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number, addressSuggestion?: string) => void;
  height?: string;
  zoom?: number;
}

export function OpenStreetMapPicker({
  latitude,
  longitude,
  onChange,
  height = "260px",
  zoom = 14,
}: OpenStreetMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const isInternalMoveRef = useRef(false);

  const [isMapReady, setIsMapReady] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Reverse geocoding using OpenStreetMap Nominatim (100% Free & Open Source)
  const fetchAddressFromCoords = async (lat: number, lng: number) => {
    try {
      setIsReverseGeocoding(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          return data.display_name;
        }
      }
    } catch (err) {
      console.warn("Nominatim reverse geocoding error:", err);
    } finally {
      setIsReverseGeocoding(false);
    }
    return undefined;
  };

  useEffect(() => {
    let isMounted = true;

    // Load Leaflet dynamically on client-side
    const initLeaflet = async () => {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      // Import Leaflet CSS if not already injected
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
        link.crossOrigin = "";
        document.head.appendChild(link);
      }

      const L = (await import("leaflet")).default;
      if (!isMounted || !mapContainerRef.current) return;

      // Avoid re-initialization if container already has a map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const initialLat = Number.isFinite(latitude) && latitude !== 0 ? latitude : 6.9271; // Default Colombo, LK
      const initialLng = Number.isFinite(longitude) && longitude !== 0 ? longitude : 79.8612;

      // Initialize Leaflet Map
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: zoom,
        zoomControl: true,
        attributionControl: false,
      });

      // Add OpenStreetMap Tile Layer (Open Source)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      // Custom Brand SVG Pin Marker
      const customPinIcon = L.divIcon({
        className: "custom-leaflet-pin",
        html: `
          <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -100%);">
            <div style="width: 32px; height: 32px; background: #36D068; border: 2.5px solid #ffffff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
              <div style="width: 10px; height: 10px; background: #0f172a; border-radius: 50%; transform: rotate(45deg);"></div>
            </div>
            <div style="position: absolute; bottom: -4px; width: 12px; height: 4px; background: rgba(0,0,0,0.25); border-radius: 50%; filter: blur(1px);"></div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      // Add draggable Marker
      const marker = L.marker([initialLat, initialLng], {
        icon: customPinIcon,
        draggable: true,
      }).addTo(map);

      markerRef.current = marker;
      mapInstanceRef.current = map;
      setIsMapReady(true);

      // Handle Marker Drag
      marker.on("dragend", async () => {
        const position = marker.getLatLng();
        const lat = Number(position.lat.toFixed(6));
        const lng = Number(position.lng.toFixed(6));
        isInternalMoveRef.current = true;
        const suggestedAddr = await fetchAddressFromCoords(lat, lng);
        onChange(lat, lng, suggestedAddr);
      });

      // Handle Map Click
      map.on("click", async (e: any) => {
        const lat = Number(e.latlng.lat.toFixed(6));
        const lng = Number(e.latlng.lng.toFixed(6));
        marker.setLatLng([lat, lng]);
        isInternalMoveRef.current = true;
        const suggestedAddr = await fetchAddressFromCoords(lat, lng);
        onChange(lat, lng, suggestedAddr);
      });

      // Fix render size issues after mount
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    };

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map and marker when external coordinates change (e.g. from GPS or manual input)
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !markerRef.current) return;

    if (isInternalMoveRef.current) {
      isInternalMoveRef.current = false;
      return;
    }

    const currentLat = Number(latitude);
    const currentLng = Number(longitude);

    if (Number.isFinite(currentLat) && Number.isFinite(currentLng) && (currentLat !== 0 || currentLng !== 0)) {
      markerRef.current.setLatLng([currentLat, currentLng]);
      mapInstanceRef.current.panTo([currentLat, currentLng], { animate: true });
    }
  }, [latitude, longitude, isMapReady]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-[#36D068]" />
          <span>Interactive OpenStreetMap (Click to set delivery pin)</span>
        </span>
        {isReverseGeocoding && (
          <span className="text-[11px] text-[#15803D] flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Resolving address...
          </span>
        )}
      </div>

      <div
        className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 z-0"
        style={{ height }}
      >
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating coordinates chip */}
        <div className="absolute bottom-2.5 left-2.5 z-10 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200/90 shadow-sm text-[11px] font-mono font-medium text-slate-700 pointer-events-none flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-[#36D068]" />
          <span>
            {Number(latitude || 6.9271).toFixed(4)}, {Number(longitude || 79.8612).toFixed(4)}
          </span>
        </div>
      </div>
    </div>
  );
}
