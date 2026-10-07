"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { locationService } from "@/services/api/location.service";
import type {
  LocationItem,
  CreateLocationPayload,
} from "@/services/api/location.service";
import {
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Navigation,
  Loader2,
  Map as MapIcon,
} from "lucide-react";

// Client-only dynamic import for OpenStreetMap Leaflet component
const OpenStreetMapPicker = dynamic(
  () =>
    import("@/components/ui/open-street-map-picker").then(
      (mod) => mod.OpenStreetMapPicker
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[200px] w-full rounded-2xl bg-slate-100 border border-slate-200 animate-pulse flex items-center justify-center text-xs text-slate-400 font-poppins">
        Loading interactive map...
      </div>
    ),
  }
);

export default function SettingsLocationsPage() {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Location Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [latitude, setLatitude] = useState<string>("6.9271");
  const [longitude, setLongitude] = useState<string>("79.8612");
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsDetected, setGpsDetected] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchLocations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await locationService.getLocations();
      setLocations(data || []);
    } catch (err) {
      console.error("Failed to load delivery locations:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // GPS Auto-detect coordinates using browser Geolocation
  const handleDetectCurrentLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetectingGps(true);
    setErrorMsg("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setLatitude(String(lat));
        setLongitude(String(lng));
        setIsDetectingGps(false);
        setGpsDetected(true);

        // Reverse geocode to auto-fill address using OpenStreetMap Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "en",
              },
            }
          );
          if (res.ok) {
            const geoData = await res.json();
            if (geoData && geoData.display_name && !newAddress.trim()) {
              setNewAddress(geoData.display_name);
            }
          }
        } catch {
          // ignore reverse geocoding failure
        }
      },
      (err) => {
        console.warn("Geolocation error:", err);
        setIsDetectingGps(false);
        setErrorMsg("Could not detect GPS location. You can enter your coordinates manually or click the map.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Handle Map Pin change
  const handleMapCoordChange = (lat: number, lng: number, suggestedAddr?: string) => {
    setLatitude(String(lat));
    setLongitude(String(lng));
    if (suggestedAddr && !newAddress.trim()) {
      setNewAddress(suggestedAddr);
    }
  };

  // Submit and create location via POST /locations API
  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.trim()) {
      setErrorMsg("Please enter a valid street address.");
      return;
    }

    const numLat = parseFloat(latitude);
    const numLng = parseFloat(longitude);

    if (isNaN(numLat) || isNaN(numLng)) {
      setErrorMsg("Please enter valid numeric latitude and longitude coordinates.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const payload: CreateLocationPayload = {
        address: newAddress.trim(),
        latitude: numLat,
        longitude: numLng,
      };

      await locationService.createLocation(payload);
      setNewAddress("");
      setLatitude("6.9271");
      setLongitude("79.8612");
      setGpsDetected(false);
      setShowAddModal(false);
      setSuccessMsg("Delivery location added successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
      await fetchLocations();
    } catch (err: any) {
      console.error("Failed to add location:", err);
      setErrorMsg(err?.message || "Failed to add delivery location. Please check your details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await locationService.setDefaultLocation(id);
      setSuccessMsg("Default delivery address updated.");
      setTimeout(() => setSuccessMsg(""), 3500);
      await fetchLocations();
    } catch (err) {
      console.error("Failed to set default location:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this delivery address?")) return;
    try {
      await locationService.deleteLocation(id);
      setSuccessMsg("Delivery address removed.");
      setTimeout(() => setSuccessMsg(""), 3500);
      await fetchLocations();
    } catch (err) {
      console.error("Failed to delete location:", err);
    }
  };

  const parsedLat = parseFloat(latitude) || 6.9271;
  const parsedLng = parseFloat(longitude) || 79.8612;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-poppins">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-oswald text-3xl sm:text-4xl font-black uppercase text-neutral-900 tracking-tight leading-tight">
            Delivery Locations & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-normal">
            Manage your morning breakfast delivery addresses, coordinates, and delivery notes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setErrorMsg("");
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#36D068] hover:bg-[#2eb85c] text-black font-oswald font-bold text-xs uppercase tracking-wider shadow-md shadow-[#36D068]/20 transition-all active:scale-95 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#15803D] text-xs font-bold flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Locations Grid */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
          <div className="p-2 rounded-xl bg-emerald-50 text-[#15803D]">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-oswald text-base sm:text-lg font-bold uppercase text-neutral-900 tracking-tight">
              Saved Delivery Addresses ({locations.length})
            </h2>
            <p className="text-xs text-slate-500">
              Assigned locations for weekday morning meal drop-offs
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
            <div className="h-28 bg-slate-100 rounded-2xl" />
            <div className="h-28 bg-slate-100 rounded-2xl" />
          </div>
        ) : locations.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <MapPin className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-medium text-slate-500">
              No delivery locations saved yet. Add your home or office address with coordinates to receive daily meals.
            </p>
            <button
              type="button"
              onClick={() => {
                setErrorMsg("");
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-neutral-900 font-oswald text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-200 shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[#36D068]" />
              <span>Add First Location</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="p-5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between gap-4 group shadow-2xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-100/70 text-[#15803D]">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="font-oswald text-xs font-bold uppercase tracking-wide text-neutral-900">Delivery Address</span>
                    </div>

                    {loc.is_default ? (
                      <span className="font-oswald text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#15803D] border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Default
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(loc.id)}
                        className="font-oswald text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-[#15803D] transition-colors"
                      >
                        Set Default
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {loc.address}
                  </p>

                  {/* Coordinates pill if present */}
                  {loc.latitude !== undefined && loc.longitude !== undefined && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-500">
                        📍 {Number(loc.latitude).toFixed(4)}, {Number(loc.longitude).toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-[#36D068]" />
                    7:00 AM – 8:30 AM Drop-off
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDelete(loc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove Location"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delivery Preferences Box */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-oswald text-base font-bold uppercase text-neutral-900 tracking-tight">Delivery Time Window</h3>
            <p className="text-xs text-slate-500">Standard weekday breakfast delivery scheduling</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-700">
          <p className="font-bold text-neutral-900">
            ⏰ Morning Window: 7:00 AM – 8:30 AM (Monday to Friday)
          </p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Our drivers leave our central commercial kitchen at 6:30 AM to ensure thermal container boxes keep your food hot & fresh.
          </p>
        </div>
      </div>

      {/* Add Location Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto font-poppins">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-[#15803D]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-oswald text-base sm:text-lg font-bold uppercase text-neutral-900 tracking-tight">Add Delivery Location</h3>
                  <p className="text-xs text-slate-500">Set street address and precise map coordinates</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLocation} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Street Address Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Street Address & Apartment / Suite <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g., 123 Galle Rd, Colombo 03"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-neutral-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#36D068] focus:bg-white transition-colors resize-none"
                />
              </div>

              {/* 2. Geolocation & Map Tools Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDetectCurrentLocation}
                  disabled={isDetectingGps}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-[#15803D] border border-emerald-200 font-oswald text-xs font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50"
                >
                  {isDetectingGps ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Navigation className="w-3.5 h-3.5 text-[#36D068]" />
                  )}
                  <span>{isDetectingGps ? "Detecting GPS..." : "From Current Location"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 font-oswald text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  <MapIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>{showMap ? "Hide Map" : "Select on OpenStreetMap"}</span>
                </button>
              </div>

              {gpsDetected && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#15803D] text-[11px] font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Current GPS location coordinates applied to map pin.</span>
                </div>
              )}

              {/* 3. Open-Source Map Picker (Leaflet / OpenStreetMap) */}
              {showMap && (
                <div className="pt-1">
                  <OpenStreetMapPicker
                    latitude={parsedLat}
                    longitude={parsedLng}
                    onChange={handleMapCoordChange}
                    height="200px"
                  />
                </div>
              )}

              {/* 4. Manual Latitude & Longitude Inputs */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-semibold text-slate-700 block">
                  Manual Coordinates (Latitude & Longitude)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 font-medium">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="6.9120"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-neutral-900 text-xs font-mono focus:outline-none focus:border-[#36D068] focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 font-medium">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="79.8612"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-neutral-900 text-xs font-mono focus:outline-none focus:border-[#36D068] focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#36D068] hover:bg-[#2eb85c] text-black font-oswald font-bold text-xs uppercase tracking-wider shadow-md shadow-[#36D068]/20 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Location</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
