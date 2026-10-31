"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Check,
  MapPin,
  RefreshCw,
  CreditCard,
  AlertCircle,
  Navigation,
  Plus,
  ArrowRight,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Sparkles,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Zap,
  Info,
  ShieldCheck,
  Lock,
  Package as PackageIcon,
  Clock,
  User,
  Mail,
  Phone,
  ExternalLink,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import {
  locationService,
  type LocationItem,
} from "@/services/api/location.service";
import { zoneService, type ZoneItem } from "@/services/api/zone.service";
import {
  subscriptionService,
  triggerPayHereCheckout,
  type SubscriptionLocationInput,
  type CreateSubscriptionReq,
} from "@/services/api/subscription.service";
import { userService, type BillingProfileRes } from "@/services/api/user.service";
import { OpenStreetMapPicker } from "@/components/ui/open-street-map-picker";
import { cn } from "@/lib/utils";

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageName: string;
  packageId?: string;
  planName: string;
  planId?: string;
  planType?: "FIXED" | "CUSTOM" | string;
  durationLimit?: number;
  discountId?: string;
  price: string;
}

// Visual color schemes for distinct delivery locations
const LOCATION_ACCENTS = [
  {
    bg: "bg-emerald-600",
    border: "border-emerald-500",
    light: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/30",
    tag: "Loc A",
  },
  {
    bg: "bg-blue-600",
    border: "border-blue-500",
    light: "bg-blue-50 text-blue-800 border-blue-200",
    dot: "bg-blue-500",
    ring: "ring-blue-500/30",
    tag: "Loc B",
  },
  {
    bg: "bg-amber-600",
    border: "border-amber-500",
    light: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
    ring: "ring-amber-500/30",
    tag: "Loc C",
  },
  {
    bg: "bg-purple-600",
    border: "border-purple-500",
    light: "bg-purple-50 text-purple-800 border-purple-200",
    dot: "bg-purple-500",
    ring: "ring-purple-500/30",
    tag: "Loc D",
  },
  {
    bg: "bg-rose-600",
    border: "border-rose-500",
    light: "bg-rose-50 text-rose-800 border-rose-200",
    dot: "bg-rose-500",
    ring: "ring-rose-500/30",
    tag: "Loc E",
  },
];

function formatYMD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatFriendlyDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function SubscribeModal({
  isOpen,
  onClose,
  packageName,
  packageId = "",
  planName,
  planId = "",
  planType = "FIXED",
  durationLimit,
  discountId,
  price,
}: SubscribeModalProps) {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  // Detect custom vs fixed plan
  const isCustomPlan = useMemo(() => {
    const typeUpper = (planType || "").toUpperCase();
    const nameLower = (planName || "").toLowerCase();
    return (
      typeUpper === "CUSTOM" ||
      nameLower.includes("custom") ||
      nameLower.includes("flexible") ||
      nameLower.includes("hybrid")
    );
  }, [planType, planName]);

  // Default day count for plan (acts as the baseline / minimum required days)
  const defaultDays = useMemo(() => {
    if (durationLimit && durationLimit > 0) return durationLimit;
    const nameLower = (planName || "").toLowerCase();
    if (nameLower.includes("monthly") || nameLower.includes("4 week") || nameLower.includes("20 day")) return 20;
    if (nameLower.includes("bi-weekly") || nameLower.includes("2 week") || nameLower.includes("10 day")) return 10;
    if (nameLower.includes("weekly") || nameLower.includes("1 week") || nameLower.includes("5 day")) return 5;
    return 12;
  }, [durationLimit, planName]);

  // Parse numeric base price from price string (e.g., "LKR 5,400.00" -> 5400)
  const basePriceNum = useMemo(() => {
    if (!price) return 0;
    const cleaned = price.replace(/[^0-9.]/g, "");
    const val = parseFloat(cleaned);
    return isNaN(val) ? 0 : val;
  }, [price]);

  // Day price = base plan price / default day count of that plan
  const dayPrice = useMemo(() => {
    if (defaultDays <= 0 || basePriceNum <= 0) return 0;
    return basePriceNum / defaultDays;
  }, [basePriceNum, defaultDays]);

  // Modal Step: "PROFILE_REQUIRED" | "SET_LOCATION" | "CHECKOUT" | "CONFIRMATION"
  const [step, setStep] = useState<"PROFILE_REQUIRED" | "SET_LOCATION" | "CHECKOUT" | "CONFIRMATION">("CHECKOUT");

  // Profile Details State from /api/v1/me/profile
  const [billingProfile, setBillingProfile] = useState<BillingProfileRes | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profFirstName, setProfFirstName] = useState("");
  const [profLastName, setProfLastName] = useState("");
  const [profPhone, setProfPhone] = useState("");
  const [profAddress, setProfAddress] = useState("");
  const [profCity, setProfCity] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Auto renewal state (Default is OFF)
  const [autoRenew, setAutoRenew] = useState(false);

  // Delivery Address Form Inputs for Set Location UI
  const [address, setAddress] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [latitude, setLatitude] = useState<number | string>(6.9271);
  const [longitude, setLongitude] = useState<number | string>(79.8612);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsDetected, setGpsDetected] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Saved user locations from GET /locations
  const [userLocations, setUserLocations] = useState<LocationItem[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [activeZones, setActiveZones] = useState<ZoneItem[]>([]);

  // Custom Plan Live Calendar States
  // mapping of { "YYYY-MM-DD": "location_id" }
  const [selectedDatesMap, setSelectedDatesMap] = useState<Record<string, string>>({});
  // The location assigned when clicking new dates on the calendar
  const [activeAssignLocationId, setActiveAssignLocationId] = useState<string>("");
  // Current month displayed on calendar
  const [calendarMonthDate, setCalendarMonthDate] = useState<Date>(() => new Date());

  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingStep, setSubmittingStep] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Minimum selectable date: Tomorrow
  const tomorrowYMD = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatYMD(tomorrow);
  }, []);

  // 6 Criteria Profile Fulfillment Checklist
  const profileChecklist = useMemo(() => {
    const fName = profFirstName.trim();
    const lName = profLastName.trim();
    const email = user?.email || "";
    const ph = profPhone.trim();
    const addr = profAddress.trim();
    const ct = profCity.trim();

    return [
      {
        id: "first_name",
        label: "First Name",
        category: "Identity",
        value: fName,
        isComplete: fName.length > 0,
        icon: User,
        hint: "Recipient first name",
      },
      {
        id: "last_name",
        label: "Last Name",
        category: "Identity",
        value: lName,
        isComplete: lName.length > 0,
        icon: User,
        hint: "Family surname",
      },
      {
        id: "email",
        label: "Email Address",
        category: "Account",
        value: email,
        isComplete: Boolean(email && email.includes("@")),
        icon: Mail,
        hint: "Account login (locked)",
        locked: true,
      },
      {
        id: "phone",
        label: "Phone Number",
        category: "Contact",
        value: ph,
        isComplete: ph.length >= 7,
        icon: Phone,
        hint: "Driver drop-off SMS (7+ digits)",
      },
      {
        id: "address",
        label: "Street Address",
        category: "Delivery",
        value: addr,
        isComplete: addr.length >= 3,
        icon: MapPin,
        hint: "Morning delivery drop-off",
      },
      {
        id: "city",
        label: "City / Region",
        category: "Delivery",
        value: ct,
        isComplete: ct.length >= 2,
        icon: Building2,
        hint: "Delivery zone / city",
      },
    ];
  }, [profFirstName, profLastName, user?.email, profPhone, profAddress, profCity]);

  const completedProfileCount = profileChecklist.filter((c) => c.isComplete).length;
  const profileCompletionPercentage = Math.round((completedProfileCount / profileChecklist.length) * 100);
  const isProfile100Percent = completedProfileCount === profileChecklist.length;

  // Helper to evaluate 100% fulfillment strictly
  const checkProfileFulfillment = (
    fName: string,
    lName: string,
    ph: string,
    addr: string,
    ct: string,
    email?: string
  ): boolean => {
    return (
      Boolean(fName.trim()) &&
      Boolean(lName.trim()) &&
      Boolean(email && email.includes("@")) &&
      Boolean(ph.trim().length >= 7) &&
      Boolean(addr.trim().length >= 3) &&
      Boolean(ct.trim().length >= 2)
    );
  };

  // Load profile, locations, and zones whenever modal opens
  useEffect(() => {
    if (!isOpen) return;

    const resetTimer = setTimeout(() => {
      setErrorMessage(null);
      setSuccessMessage(null);
      setSubmittingStep("");
      setSelectedDatesMap({});
    }, 0);

    async function loadData() {
      if (!user) return;
      setIsLoadingLocations(true);
      setIsLoadingProfile(true);

      try {
        // 1. Fetch user profile from /api/v1/me/profile
        const profileData = await userService.getBillingProfile();
        setBillingProfile(profileData);

        const fName = profileData?.first_name || "";
        const lName = profileData?.last_name || "";
        const ph = profileData?.phone || "";
        const addr = profileData?.address || "";
        const ct = profileData?.city || "";

        setProfFirstName(fName);
        setProfLastName(lName);
        setProfPhone(ph);
        setProfAddress(addr);
        setProfCity(ct);

        // Check if profile fulfills 100% of registration details
        const isFulfill100 = checkProfileFulfillment(fName, lName, ph, addr, ct, user?.email);

        // 2. Fetch locations and delivery zones
        let locations: LocationItem[] = [];
        try {
          locations = await locationService.getLocations();
          setUserLocations(locations);
        } catch (locErr) {
          console.warn("Could not load user locations:", locErr);
        }

        try {
          const zones = await zoneService.getZones();
          if (zones && zones.length > 0) {
            setActiveZones(zones);
            setSelectedZone(zones[0].name);
          }
        } catch (zoneErr) {
          console.warn("Could not load zones:", zoneErr);
        }

        // 3. ENFORCE 100% PROFILE FULFILLMENT FIRST!
        if (!isFulfill100) {
          // If profile is not 100% complete, switch directly to PROFILE_REQUIRED step!
          setStep("PROFILE_REQUIRED");
          return;
        }

        // 4. If profile IS 100% complete, ensure delivery address is linked
        if (locations.length === 0 && addr.trim()) {
          const fullAddr = ct.trim() ? `${addr.trim()}, ${ct.trim()}` : addr.trim();
          let targetId = "";
          try {
            const created = await locationService.createLocation({
              address: fullAddr,
              latitude: 6.9271,
              longitude: 79.8612,
            });
            targetId = created?.id || (created as { id?: string; location_id?: string })?.location_id || `loc-prof-${Date.now()}`;
          } catch {
            targetId = `loc-prof-${Date.now()}`;
          }

          const autoLoc: LocationItem = {
            id: targetId,
            address: fullAddr,
            latitude: 6.9271,
            longitude: 79.8612,
            is_default: true,
          };
          setUserLocations([autoLoc]);
          setSelectedLocationId(targetId);
          setActiveAssignLocationId(targetId);
          setAddress(fullAddr);
        } else if (locations.length > 0) {
          const defaultLoc = locations.find((l) => l.is_default) || locations[0];
          setSelectedLocationId(defaultLoc.id);
          setActiveAssignLocationId(defaultLoc.id);
          setAddress(defaultLoc.address);
          if (defaultLoc.latitude !== undefined) setLatitude(defaultLoc.latitude);
          if (defaultLoc.longitude !== undefined) setLongitude(defaultLoc.longitude);
        }

        // Advance to Checkout
        setStep("CHECKOUT");
      } catch (err) {
        console.warn("Could not load user profile/locations:", err);
        setStep("PROFILE_REQUIRED");
      } finally {
        setIsLoadingLocations(false);
        setIsLoadingProfile(false);
      }
    }

    loadData();
    return () => clearTimeout(resetTimer);
  }, [isOpen, user]);

  // Keep activeAssignLocationId in sync with selectedLocationId if not set
  useEffect(() => {
    if (!activeAssignLocationId && selectedLocationId) {
      const syncTimer = setTimeout(() => {
        setActiveAssignLocationId(selectedLocationId);
      }, 0);
      return () => clearTimeout(syncTimer);
    }
  }, [selectedLocationId, activeAssignLocationId]);

  // GPS Auto-detect coordinates using browser Geolocation
  const handleDetectGps = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setErrorMessage("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetectingGps(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lng);
        setIsDetectingGps(false);
        setGpsDetected(true);

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
            if (geoData && geoData.display_name && !address.trim()) {
              setAddress(geoData.display_name);
            }
          }
        } catch {
          // ignore
        }
      },
      (err) => {
        console.warn("Geolocation error:", err);
        setIsDetectingGps(false);
        setErrorMessage("Could not detect GPS location. You can enter your coordinates manually.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleMapPickerChange = (lat: number, lng: number, suggestedAddr?: string) => {
    setLatitude(lat);
    setLongitude(lng);
    if (suggestedAddr && !address.trim()) {
      setAddress(suggestedAddr);
    }
  };

  // ─── Inline Profile 100% Fulfillment Handler ───
  // Save inline profile details via PUT /api/v1/me/profile and advance to Checkout
  const handleSaveProfileAndContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation matching backend /api/v1/me/profile schema
    if (!profFirstName.trim()) {
      setErrorMessage("First name is required.");
      return;
    }
    if (!profLastName.trim()) {
      setErrorMessage("Last name is required.");
      return;
    }
    if (!profPhone.trim() || profPhone.trim().length < 7) {
      setErrorMessage("Please enter a valid phone number (at least 7 digits).");
      return;
    }
    if (!profAddress.trim() || profAddress.trim().length < 3) {
      setErrorMessage("Street delivery address is required (at least 3 characters).");
      return;
    }
    if (!profCity.trim() || profCity.trim().length < 2) {
      setErrorMessage("City / region is required (at least 2 characters).");
      return;
    }

    setIsSavingProfile(true);
    try {
      // Execute PUT /api/v1/me/profile
      const updated = await userService.updateBillingProfile({
        first_name: profFirstName.trim(),
        last_name: profLastName.trim(),
        phone: profPhone.trim(),
        address: profAddress.trim(),
        city: profCity.trim(),
      });

      if (updated) {
        setBillingProfile(updated);
      }

      if (user) {
        setUser({
          ...user,
          name: `${profFirstName.trim()} ${profLastName.trim()}`.trim(),
        });
      }

      // Automatically register/update location from verified profile address
      const fullAddress = `${profAddress.trim()}, ${profCity.trim()}`;
      let savedLocId = selectedLocationId;

      try {
        const createdLoc = await locationService.createLocation({
          address: fullAddress,
          latitude: Number(latitude) || 6.9271,
          longitude: Number(longitude) || 79.8612,
        });
        savedLocId = createdLoc?.id || (createdLoc as { id?: string; location_id?: string })?.location_id || `loc-prof-${Date.now()}`;
      } catch {
        savedLocId = `loc-prof-${Date.now()}`;
      }

      const newLoc: LocationItem = {
        id: savedLocId,
        address: fullAddress,
        latitude: Number(latitude) || 6.9271,
        longitude: Number(longitude) || 79.8612,
        is_default: true,
      };

      setUserLocations((prev) => {
        const remaining = prev.filter((l) => l.id !== savedLocId);
        return [newLoc, ...remaining];
      });
      setSelectedLocationId(savedLocId);
      setActiveAssignLocationId(savedLocId);
      setAddress(fullAddress);

      setSuccessMessage("Profile verified 100%! Ready to configure subscription.");
      setTimeout(() => setSuccessMessage(null), 3500);

      setStep("CHECKOUT");
    } catch (err: unknown) {
      console.error("Failed to update profile:", err);
      const msg =
        err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string"
          ? (err as { message: string }).message
          : err instanceof Error
          ? err.message
          : "Failed to update profile details. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Submit and save new delivery location via POST /locations & GET /locations/{id}
  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      setErrorMessage("Please enter a valid street delivery address.");
      return;
    }

    setIsSavingLocation(true);
    setErrorMessage(null);

    try {
      const numLat = Number(latitude) || 6.9271;
      const numLng = Number(longitude) || 79.8612;

      let fullAddress = address.trim();
      if (selectedZone && !fullAddress.toLowerCase().includes(selectedZone.toLowerCase())) {
        fullAddress = `${fullAddress}, ${selectedZone}`;
      }

      let savedId = "";
      try {
        // 1. Attempt POST /locations
        const createdLoc = await locationService.createLocation({
          address: fullAddress,
          latitude: numLat,
          longitude: numLng,
        });
        savedId = createdLoc?.id || (createdLoc as { id?: string; location_id?: string })?.location_id || "";
      } catch (apiErr) {
        console.warn("Location save via API returned error or unauthorized, saving to session:", apiErr);
        savedId = `loc-local-${Date.now()}`;
      }

      // 2. Refresh or build local list
      let freshLocations: LocationItem[] = [];
      try {
        freshLocations = await locationService.getLocations();
      } catch {
        freshLocations = [];
      }

      if (!freshLocations.some((l) => l.id === savedId)) {
        freshLocations = [
          ...freshLocations,
          {
            id: savedId || `loc-local-${Date.now()}`,
            address: fullAddress,
            latitude: numLat,
            longitude: numLng,
            is_default: freshLocations.length === 0,
          },
        ];
      }

      setUserLocations(freshLocations);
      const targetId = savedId || freshLocations[freshLocations.length - 1]?.id || "";
      if (targetId) {
        setSelectedLocationId(targetId);
        setActiveAssignLocationId(targetId);
      }

      setSuccessMessage("Delivery location saved successfully!");
      setTimeout(() => {
        setSuccessMessage(null);
        setStep("CHECKOUT");
      }, 350);
    } catch (err: unknown) {
      console.error("Failed to save delivery location:", err);
      const msg =
        err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string"
          ? (err as { message: string }).message
          : err instanceof Error
          ? err.message
          : "Failed to save delivery location. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsSavingLocation(false);
    }
  };

  // ─── Custom Plan Calendar Helpers ───
  const year = calendarMonthDate.getFullYear();
  const month = calendarMonthDate.getMonth();

  const calendarDays = useMemo(() => {
    const days: Array<{
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isPast: boolean;
      dayOfWeek: number;
    }> = [];

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Find starting Monday (before or on the first day of month)
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const startCursor = new Date(firstDayOfMonth);
    if (firstDayOfWeek === 0) {
      // Sunday -> start next day (Monday)
      startCursor.setDate(startCursor.getDate() + 1);
    } else if (firstDayOfWeek === 6) {
      // Saturday -> start Monday
      startCursor.setDate(startCursor.getDate() + 2);
    } else if (firstDayOfWeek > 1) {
      // Tue, Wed, Thu, Fri -> go back to Monday of the week
      startCursor.setDate(startCursor.getDate() - (firstDayOfWeek - 1));
    }

    // Find ending Friday (after or on the last day of month)
    const lastDayOfWeek = lastDayOfMonth.getDay();
    const endCursor = new Date(lastDayOfMonth);
    if (lastDayOfWeek === 0) {
      // Sunday -> go back to Friday
      endCursor.setDate(endCursor.getDate() - 2);
    } else if (lastDayOfWeek === 6) {
      // Saturday -> go back to Friday
      endCursor.setDate(endCursor.getDate() - 1);
    } else if (lastDayOfWeek < 5) {
      // Mon, Tue, Wed, Thu -> go forward to Friday of that week
      endCursor.setDate(endCursor.getDate() + (5 - lastDayOfWeek));
    }

    // Iterate through all days and include only Monday to Friday
    const curr = new Date(startCursor);
    while (curr <= endCursor) {
      const dow = curr.getDay();
      if (dow >= 1 && dow <= 5) {
        const str = formatYMD(curr);
        days.push({
          dateStr: str,
          dayNum: curr.getDate(),
          isCurrentMonth: curr.getMonth() === month,
          isPast: str < tomorrowYMD,
          dayOfWeek: dow,
        });
      }
      curr.setDate(curr.getDate() + 1);
    }

    return days;
  }, [year, month, tomorrowYMD]);

  // Navigate calendar months
  const handlePrevMonth = () => {
    setCalendarMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCalendarMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Toggle date selection on live calendar (Weekdays only: Mon-Fri)
  const handleToggleCalendarDate = (dateStr: string) => {
    // Lock Saturday and Sunday (no delivery)
    const [y, m, d] = dateStr.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    if (dateObj.getDay() === 0 || dateObj.getDay() === 6) {
      return;
    }

    setErrorMessage(null);
    setSelectedDatesMap((prev) => {
      const next = { ...prev };
      if (next[dateStr]) {
        // Unselect
        delete next[dateStr];
        return next;
      }

      // Assign with activeAssignLocationId
      const targetLocId = activeAssignLocationId || selectedLocationId || (userLocations[0]?.id ?? "");
      if (!targetLocId) {
        setErrorMessage("Please select or add a delivery location first.");
        return prev;
      }

      next[dateStr] = targetLocId;
      return next;
    });
  };

  // Quick auto-select upcoming weekdays up to defaultDays
  const handleAutoSelectWeekdays = () => {
    setErrorMessage(null);
    const targetLocId = activeAssignLocationId || selectedLocationId || (userLocations[0]?.id ?? "");
    if (!targetLocId) {
      setErrorMessage("Please select a delivery location first.");
      return;
    }

    const newMap: Record<string, string> = {};
    const cursor = new Date();
    cursor.setDate(cursor.getDate() + 1); // Start tomorrow

    let count = 0;
    while (count < defaultDays) {
      const dayOfWeek = cursor.getDay();
      // Only Monday to Friday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const str = formatYMD(cursor);
        newMap[str] = targetLocId;
        count++;
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    setSelectedDatesMap(newMap);
  };

  // Clear all selected dates
  const handleClearSelectedDates = () => {
    setSelectedDatesMap({});
    setErrorMessage(null);
  };

  // Change location for an individual selected date
  const handleChangeDateLocation = (dateStr: string, locId: string) => {
    setSelectedDatesMap((prev) => ({
      ...prev,
      [dateStr]: locId,
    }));
  };

  // Selected dates grouped by location
  const groupedLocations = useMemo(() => {
    const map: Record<string, string[]> = {};
    Object.entries(selectedDatesMap).forEach(([dateStr, locId]) => {
      if (!map[locId]) map[locId] = [];
      map[locId].push(dateStr);
    });

    return Object.entries(map).map(([locId, dates]) => {
      const loc = userLocations.find((l) => l.id === locId);
      const locIndex = userLocations.findIndex((l) => l.id === locId);
      const color = LOCATION_ACCENTS[(locIndex >= 0 ? locIndex : 0) % LOCATION_ACCENTS.length];
      return {
        locationId: locId,
        location: loc,
        dates: dates.sort(),
        color,
      };
    });
  }, [selectedDatesMap, userLocations]);

  const selectedDatesCount = Object.keys(selectedDatesMap).length;

  // Pricing calculations for custom plan with additional days
  const { additionalDays, additionalCost, displayPrice } = useMemo(() => {
    if (!isCustomPlan) {
      return {
        additionalDays: 0,
        additionalCost: 0,
        displayPrice: price,
      };
    }

    const extraDays = Math.max(0, selectedDatesCount - defaultDays);
    const extraCost = extraDays * dayPrice;
    const total = basePriceNum + extraCost;

    const formatted = `LKR ${total.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    return {
      additionalDays: extraDays,
      additionalCost: extraCost,
      displayPrice: formatted,
    };
  }, [isCustomPlan, selectedDatesCount, defaultDays, dayPrice, basePriceNum, price]);

  // 1. Validate configuration and proceed to Confirmation Step
  const handleReviewDetails = (e: React.FormEvent) => {
    e.preventDefault();

    // Login required check
    if (!user) {
      const returnUrl =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search + window.location.hash
          : "/plans";
      router.push("/login?callbackUrl=" + encodeURIComponent(returnUrl));
      return;
    }

    setErrorMessage(null);

    // Profile 100% fulfillment check before proceeding to Confirmation
    const isProfileComplete = checkProfileFulfillment(
      profFirstName,
      profLastName,
      profPhone,
      profAddress,
      profCity,
      user?.email
    );
    if (!isProfileComplete) {
      setErrorMessage("100% profile fulfillment is required before subscribing. Please fulfill your profile.");
      setStep("PROFILE_REQUIRED");
      return;
    }

    // Custom Plan Validations
    if (isCustomPlan) {
      if (selectedDatesCount === 0) {
        setErrorMessage("Please select delivery dates on the calendar.");
        return;
      }
      if (selectedDatesCount < defaultDays) {
        setErrorMessage(
          `Please select at least ${defaultDays} delivery days for your plan (${selectedDatesCount} currently selected. Need ${defaultDays - selectedDatesCount} more).`
        );
        return;
      }
    } else {
      // Fixed Plan Validation
      if (!selectedLocationId) {
        setErrorMessage("Please select or add a delivery location to continue.");
        setStep("SET_LOCATION");
        return;
      }
    }

    // Proceed to Step 2: Confirmation Popup
    setStep("CONFIRMATION");
  };

  // 2. Final Subscription Creation and PayHere Redirection
  const handleFinalPayHereCheckout = async () => {
    if (!user) {
      const returnUrl =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search + window.location.hash
          : "/plans";
      router.push("/login?callbackUrl=" + encodeURIComponent(returnUrl));
      return;
    }

    // Enforce 100% profile fulfillment before finalizing payment
    const isProfileComplete = checkProfileFulfillment(
      profFirstName,
      profLastName,
      profPhone,
      profAddress,
      profCity,
      user?.email
    );
    if (!isProfileComplete) {
      setErrorMessage("100% profile fulfillment is required before subscribing. Please fulfill your profile.");
      setStep("PROFILE_REQUIRED");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      setSubmittingStep("Initializing subscription checkout with PayHere...");
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3000";
      const currentPath =
        typeof window !== "undefined"
          ? window.location.pathname
          : "/plans";
      const returnUrl = `${origin}${currentPath}?payment=success`;
      const cancelUrl = `${origin}${currentPath}?payment=cancelled`;

      let payload: CreateSubscriptionReq;

      if (isCustomPlan) {
        // Custom plan payload with multiple locations & dates array
        const locationsPayload: SubscriptionLocationInput[] = groupedLocations.map((g) => ({
          location_id: g.locationId,
          dates: g.dates,
        }));

        payload = {
          package_id: packageId,
          subscription_plan_id: planId,
          plan_id: planId,
          discount_id: discountId || undefined,
          locations: locationsPayload,
          auto_renew: autoRenew,
          return_url: returnUrl,
          cancel_url: cancelUrl,
        };
      } else {
        // Fixed plan payload with single location_id
        payload = {
          package_id: packageId,
          subscription_plan_id: planId,
          plan_id: planId,
          discount_id: discountId || undefined,
          location_id: selectedLocationId,
          locations: [
            {
              location_id: selectedLocationId,
              dates: [],
            },
          ],
          auto_renew: autoRenew,
          return_url: returnUrl,
          cancel_url: cancelUrl,
        };
      }

      const checkoutRes = await subscriptionService.createSubscription(payload);

      if (checkoutRes?.checkout_params) {
        onClose();
        triggerPayHereCheckout(checkoutRes.checkout_params);
      } else {
        throw new Error("Invalid response from subscription checkout.");
      }
    } catch (err: unknown) {
      console.error("Subscription checkout error:", err);
      const msg =
        err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string"
          ? (err as { message: string }).message
          : err instanceof Error
          ? err.message
          : "Subscription setup failed. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
      setSubmittingStep("");
    }
  };

  const selectedLocation = userLocations.find((l) => l.id === selectedLocationId) || userLocations[0];

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed",
        "inset-0",
        "z-50",
        "bg-black/75",
        "backdrop-blur-sm",
        "flex",
        "items-center",
        "justify-center",
        "p-3",
        "sm:p-5"
      )}
    >
      <div
        className={cn(
          "bg-white",
          "rounded-3xl",
          "border",
          "border-slate-200",
          "shadow-2xl",
          isCustomPlan || step === "CONFIRMATION" || step === "PROFILE_REQUIRED" ? "max-w-2xl" : "max-w-lg",
          "w-full",
          "p-5",
          "sm:p-7",
          "space-y-4 sm:space-y-5",
          "animate-in",
          "fade-in",
          "zoom-in-95",
          "duration-150",
          "relative",
          "max-h-[94vh]",
          "overflow-y-auto"
        )}
      >
        {/* ─── Modal Header ─── */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#0B3B17]/10 text-[#0B3B17]">
              {step === "PROFILE_REQUIRED" ? (
                <User className="w-5 h-5 text-[#28B454]" />
              ) : step === "SET_LOCATION" ? (
                <MapPin className="w-5 h-5 text-[#28B454]" />
              ) : step === "CONFIRMATION" ? (
                <ShieldCheck className="w-5 h-5 text-[#28B454]" />
              ) : isCustomPlan ? (
                <CalendarIcon className="w-5 h-5 text-[#28B454]" />
              ) : (
                <CreditCard className="w-5 h-5 text-[#28B454]" />
              )}
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] font-bold font-oswald uppercase tracking-wider text-[#28B454]">
                <span>
                  {step === "PROFILE_REQUIRED"
                    ? "STEP 1 OF 3 • PROFILE SETUP (100% REQUIRED)"
                    : step === "SET_LOCATION"
                    ? "DELIVERY ADDRESS SETUP"
                    : step === "CONFIRMATION"
                    ? "STEP 2 OF 2 • ORDER CONFIRMATION"
                    : isCustomPlan
                    ? `STEP 1 OF 2 • ${defaultDays} DAYS SCHEDULE`
                    : "STEP 1 OF 2 • DELIVERY & PLAN SETUP"}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-oswald uppercase">
                {step === "PROFILE_REQUIRED"
                  ? "Complete Profile to Subscribe"
                  : step === "SET_LOCATION"
                  ? "Set Delivery Location"
                  : step === "CONFIRMATION"
                  ? "Confirm Your Subscription"
                  : isCustomPlan
                  ? "Live Delivery Calendar & Locations"
                  : "Delivery Address & Options"}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ─── Selected Package & Plan Summary Badge ─── */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#28B454] uppercase tracking-wider block font-oswald">
                {packageName || "MEAL PLAN"}
              </span>
              {isCustomPlan && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#0B3B17] text-[10px] font-black font-oswald uppercase">
                  Custom Dates
                </span>
              )}
            </div>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 block mt-0.5 font-oswald">
              {planName || "Subscription Plan"}
            </span>
          </div>
          <div className="bg-[#0B3B17] text-white px-3.5 py-1.5 rounded-xl text-sm sm:text-base font-black font-oswald shadow-xs shrink-0">
            {displayPrice}
          </div>
        </div>

        {/* ─── Error / Success Banners ─── */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Loading Profile Spinner */}
        {(isLoadingProfile || isLoadingLocations) && (
          <div className="p-8 flex flex-col items-center justify-center gap-3 text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-[#28B454]" />
            <span className="text-xs font-bold text-slate-600 font-oswald uppercase tracking-wider">
              Checking profile completion status...
            </span>
          </div>
        )}

        {/* ─── STEP 0: 100% REGISTRATION PROFILE REQUIRED FORM ─── */}
        {!isLoadingProfile && !isLoadingLocations && step === "PROFILE_REQUIRED" && (
          <form onSubmit={handleSaveProfileAndContinue} className="space-y-4">
            {/* Completion Hero Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0B3B17]/5 via-emerald-50/60 to-white border border-[#28B454]/25 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0B3B17] text-[10px] font-black font-oswald uppercase tracking-wider mb-1">
                    <Sparkles className="w-3 h-3 text-[#28B454]" />
                    <span>Profile Fulfillment Required</span>
                  </div>
                  <h4 className="font-oswald text-base sm:text-lg font-bold text-slate-900 uppercase">
                    100% Registration Profile Needed to Subscribe
                  </h4>
                  <p className="text-xs text-slate-600 font-normal leading-relaxed mt-0.5">
                    Before subscribing to your meal plan, all 6 registration profile details must be completed for daily chef morning preparation, rider delivery dispatch, and billing receipts.
                  </p>
                </div>

                {/* Percentage Indicator Widget */}
                <div className="text-right shrink-0">
                  <div className="inline-flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-white border border-emerald-200 shadow-xs">
                    <span
                      className={cn(
                        "font-oswald text-xl font-black leading-none",
                        profileCompletionPercentage === 100 ? "text-[#28B454]" : "text-amber-600"
                      )}
                    >
                      {profileCompletionPercentage}%
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase font-oswald mt-1">
                      {completedProfileCount}/6 Items
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500 ease-out",
                      profileCompletionPercentage === 100
                        ? "bg-gradient-to-r from-[#28B454] to-[#36D068]"
                        : "bg-gradient-to-r from-amber-500 to-[#28B454]"
                    )}
                    style={{ width: `${Math.max(5, profileCompletionPercentage)}%` }}
                  />
                </div>
              </div>

              {/* 6 Criteria Status Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                {profileChecklist.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "px-2.5 py-1.5 rounded-xl border text-[11px] font-medium flex items-center justify-between gap-1.5 transition-all",
                      item.isComplete
                        ? "bg-emerald-50/80 border-emerald-200 text-emerald-800"
                        : "bg-amber-50/70 border-amber-200 text-amber-800"
                    )}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <item.icon className={cn("w-3.5 h-3.5 shrink-0", item.isComplete ? "text-[#28B454]" : "text-amber-500")} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.isComplete ? (
                      <Check className="w-3 h-3 text-[#28B454]" />
                    ) : (
                      <span className="text-[9px] font-bold uppercase font-oswald bg-amber-200/80 text-amber-900 px-1 py-0.2 rounded shrink-0">
                        Needed
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Inline Profile Input Fields */}
            <div className="space-y-3">
              {/* Row 1: First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold font-oswald uppercase tracking-wider text-slate-700 mb-1">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={profFirstName}
                      onChange={(e) => setProfFirstName(e.target.value)}
                      placeholder="e.g. Kasun"
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#28B454] focus:ring-2 focus:ring-[#28B454]/20 text-xs font-medium transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold font-oswald uppercase tracking-wider text-slate-700 mb-1">
                    Last Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={profLastName}
                      onChange={(e) => setProfLastName(e.target.value)}
                      placeholder="e.g. Perera"
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#28B454] focus:ring-2 focus:ring-[#28B454]/20 text-xs font-medium transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Email (Locked) & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold font-oswald uppercase tracking-wider text-slate-700">
                      Account Email
                    </label>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1 font-oswald">
                      <Lock className="w-2.5 h-2.5 text-slate-400" />
                      <span>Locked</span>
                    </span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      readOnly
                      disabled
                      value={user?.email || ""}
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-xs font-medium cursor-not-allowed select-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold font-oswald uppercase tracking-wider text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={profPhone}
                      onChange={(e) => setProfPhone(e.target.value)}
                      placeholder="e.g. 0771234567"
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#28B454] focus:ring-2 focus:ring-[#28B454]/20 text-xs font-medium transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Street Address & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold font-oswald uppercase tracking-wider text-slate-700 mb-1">
                    Delivery Street Address *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={profAddress}
                      onChange={(e) => setProfAddress(e.target.value)}
                      placeholder="e.g. 114/10, Dehigahahena, Hiyare"
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#28B454] focus:ring-2 focus:ring-[#28B454]/20 text-xs font-medium transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold font-oswald uppercase tracking-wider text-slate-700 mb-1">
                    City / Region *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={profCity}
                      onChange={(e) => setProfCity(e.target.value)}
                      placeholder="e.g. Galle"
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#28B454] focus:ring-2 focus:ring-[#28B454]/20 text-xs font-medium transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold font-oswald uppercase hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/profile")}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 font-oswald uppercase tracking-wide hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span>Open Full Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="submit"
                disabled={isSavingProfile}
                className="ml-auto px-6 py-3 rounded-xl bg-[#0B3B17] hover:bg-[#124D20] text-white text-xs sm:text-sm font-bold font-oswald uppercase tracking-wider transition-all shadow-md shadow-[#0B3B17]/25 flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSavingProfile ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#36D068]" />
                    <span>Saving Profile via /api/v1/me/profile...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#36D068]" />
                    <span>Save Profile &amp; Unlock Subscription</span>
                    <ArrowRight className="w-4 h-4 text-[#36D068]" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ─── STEP 1: SET DELIVERY LOCATION FORM ─── */}
        {!isLoadingProfile && step === "SET_LOCATION" && (
          <form onSubmit={handleSaveLocation} className="space-y-4">
            <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-emerald-900 font-oswald text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#28B454]" />
                <span>Delivery Location Required</span>
              </div>
              <p className="text-[11.5px] text-slate-600 font-normal leading-relaxed">
                Please enter your delivery address so our chef hub can schedule your fresh morning breakfast delivery.
              </p>
            </div>

            {/* Street Address Input */}
            <div>
              <label className="block text-[11px] font-bold font-oswald uppercase tracking-wider text-slate-700 mb-1">
                Street Address / Building / Unit *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. No. 45, Alfred House Gardens, Floor 3 (Home/Office)"
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#28B454] focus:ring-2 focus:ring-[#28B454]/20 text-xs font-medium transition-all"
                />
              </div>
            </div>

            {/* Delivery Zone Selector */}
            {activeZones.length > 0 && (
              <div>
                <label className="block text-[11px] font-bold font-oswald uppercase tracking-wider text-slate-700 mb-1">
                  Delivery Zone Hub
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#28B454] focus:ring-2 focus:ring-[#28B454]/20 text-xs font-semibold cursor-pointer transition-all"
                  >
                    {activeZones.map((zone) => (
                      <option key={zone.id} value={zone.name}>
                        📍 {zone.name} Delivery Hub
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* GPS Coordinates (Latitude & Longitude) */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-bold font-oswald uppercase tracking-wider text-slate-700 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-[#28B454]" />
                  <span>Delivery Coordinates</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDetectGps}
                    disabled={isDetectingGps}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#28B454] hover:underline cursor-pointer disabled:opacity-50 font-oswald uppercase tracking-wide"
                  >
                    {isDetectingGps ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Detecting GPS...</span>
                      </>
                    ) : gpsDetected ? (
                      <>
                        <Check className="w-3 h-3 text-[#28B454]" />
                        <span>GPS Detected!</span>
                      </>
                    ) : (
                      <>
                        <span>📍 Current Location</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowMapPicker(!showMapPicker)}
                    className="text-[11px] font-bold text-slate-600 hover:text-slate-900 underline font-oswald uppercase tracking-wide"
                  >
                    {showMapPicker ? "Hide Map" : "OpenStreetMap"}
                  </button>
                </div>
              </div>

              {showMapPicker && (
                <div className="pt-1">
                  <OpenStreetMapPicker
                    latitude={Number(latitude) || 6.9271}
                    longitude={Number(longitude) || 79.8612}
                    onChange={handleMapPickerChange}
                    height="180px"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[10px] text-slate-500 font-medium block mb-0.5">Latitude:</span>
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="6.9271"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-mono focus:outline-none focus:border-[#28B454]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-medium block mb-0.5">Longitude:</span>
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="79.8612"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-mono focus:outline-none focus:border-[#28B454]"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-100">
              {userLocations.length > 0 || isProfile100Percent ? (
                <button
                  type="button"
                  onClick={() => setStep("CHECKOUT")}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold font-oswald uppercase hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Checkout</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep("PROFILE_REQUIRED")}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold font-oswald uppercase hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Profile</span>
                </button>
              )}

              <button
                type="submit"
                disabled={isSavingLocation}
                className="ml-auto px-6 py-2.5 rounded-xl bg-[#0B3B17] hover:bg-[#124D20] text-white text-xs font-bold font-oswald uppercase tracking-wider transition-all shadow-md shadow-[#0B3B17]/20 flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSavingLocation ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Location...</span>
                  </>
                ) : (
                  <>
                    <span>Save Location &amp; Continue</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#36D068]" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ─── STEP 1: SUBSCRIPTION CONFIGURATION (CALENDAR / ADDRESS / RENEWAL) ─── */}
        {!isLoadingProfile && step === "CHECKOUT" && (
          <form onSubmit={handleReviewDetails} className="space-y-4">
            {/* ══════════════════════════════════════════════════════════════
                CUSTOM PLAN: LIVE INTERACTIVE DELIVERY CALENDAR & MULTI-LOCATION
               ══════════════════════════════════════════════════════════════ */}
            {isCustomPlan ? (
              <div className="space-y-4">
                {/* 100% Verified Profile Recipient Card for Custom Plan */}
                <div className="p-3 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-white border border-emerald-300 flex items-center justify-center shrink-0 text-[#28B454]">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-950 font-oswald uppercase truncate">
                          {profFirstName} {profLastName}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-200 text-[#0B3B17] text-[9px] font-black font-oswald uppercase tracking-wider shrink-0">
                          ✓ 100% Profile Verified
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-800 font-medium truncate block">
                        {profPhone} • {profAddress}, {profCity}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep("PROFILE_REQUIRED")}
                    className="text-[10px] font-bold font-oswald uppercase tracking-wider text-[#28B454] hover:underline shrink-0 cursor-pointer"
                  >
                    Edit Profile
                  </button>
                </div>

                {/* 1. Location Assignment Toolbar for Custom Plan */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] font-bold font-oswald uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#28B454]" />
                      <span>Select Location to Assign Dates</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setStep("SET_LOCATION")}
                      className="text-[11px] font-bold font-oswald uppercase tracking-wider text-[#28B454] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add New Address</span>
                    </button>
                  </div>

                  {userLocations.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {userLocations.map((loc, idx) => {
                        const isSelected = activeAssignLocationId === loc.id;
                        const accent = LOCATION_ACCENTS[idx % LOCATION_ACCENTS.length];
                        return (
                          <button
                            key={loc.id}
                            type="button"
                            onClick={() => setActiveAssignLocationId(loc.id)}
                            className={cn(
                              "px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all text-left cursor-pointer",
                              isSelected
                                ? `${accent.light} ${accent.border} shadow-xs ring-2 ${accent.ring}`
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                            )}
                          >
                            <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", accent.bg)} />
                            <span className="max-w-[200px] truncate">
                              {loc.address}
                            </span>
                            {isSelected && (
                              <span className="ml-auto text-[10px] font-bold font-oswald uppercase text-[#28B454] bg-[#28B454]/10 px-1.5 py-0.5 rounded-md">
                                Active
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-center justify-between gap-2">
                      <span className="text-xs text-amber-800 font-medium">No saved delivery address.</span>
                      <button
                        type="button"
                        onClick={() => setStep("SET_LOCATION")}
                        className="text-xs font-bold text-[#28B454] uppercase font-oswald hover:underline"
                      >
                        Set Delivery Address &rarr;
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-200/60">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Click any date below to schedule delivery to the active location selected above.</span>
                  </div>
                </div>

                {/* 2. Selection Progress Bar & Quick Action Buttons */}
                <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-oswald uppercase tracking-wider text-slate-900">
                        Delivery Schedule Progress:
                      </span>
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-xs font-black font-oswald uppercase",
                          selectedDatesCount >= defaultDays
                            ? additionalDays > 0
                              ? "bg-emerald-600 text-white shadow-2xs"
                              : "bg-emerald-100 text-emerald-800"
                            : selectedDatesCount > 0
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {selectedDatesCount < defaultDays
                          ? `${selectedDatesCount} / ${defaultDays} Days (Min ${defaultDays})`
                          : selectedDatesCount === defaultDays
                          ? `${selectedDatesCount} Days (Standard Plan)`
                          : `${selectedDatesCount} Days (+${additionalDays} Extra Days)`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAutoSelectWeekdays}
                        className="px-2.5 py-1 rounded-lg bg-[#0B3B17]/10 hover:bg-[#0B3B17]/20 text-[#0B3B17] text-[11px] font-bold font-oswald uppercase tracking-wide transition-colors flex items-center gap-1 cursor-pointer"
                        title={`Automatically pick the default ${defaultDays} weekdays`}
                      >
                        <Zap className="w-3 h-3 text-[#28B454]" />
                        <span>Auto-Pick {defaultDays} Weekdays</span>
                      </button>

                      {selectedDatesCount > 0 && (
                        <button
                          type="button"
                          onClick={handleClearSelectedDates}
                          className="px-2 py-1 rounded-lg text-slate-400 hover:text-red-600 text-[11px] font-bold font-oswald uppercase tracking-wide hover:bg-red-50 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Clear</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress track */}
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-300 rounded-full",
                        additionalDays > 0
                          ? "bg-gradient-to-r from-[#28B454] to-emerald-400 shadow-xs"
                          : "bg-[#28B454]"
                      )}
                      style={{
                        width: `${Math.min(100, (selectedDatesCount / defaultDays) * 100)}%`,
                      }}
                    />
                  </div>

                  {/* Dynamic Pricing Info & Extra Days Notice */}
                  <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-600 flex-wrap">
                      <span className="font-semibold text-slate-800">
                        Base Plan: {defaultDays} Days ({`LKR ${basePriceNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`})
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 font-medium">
                        Day Rate: {`LKR ${dayPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/day`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {additionalDays > 0 ? (
                        <div className="flex items-center gap-1.5 text-emerald-800 font-bold font-oswald text-xs bg-emerald-100/90 px-2 py-0.5 rounded-lg border border-emerald-300">
                          <Plus className="w-3 h-3 text-[#28B454]" />
                          <span>+{additionalDays} Extra Days (+{`LKR ${additionalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`})</span>
                        </div>
                      ) : selectedDatesCount < defaultDays ? (
                        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          Need {defaultDays - selectedDatesCount} more day{defaultDays - selectedDatesCount > 1 ? "s" : ""}
                        </span>
                      ) : null}

                      <div className="text-right pl-2 border-l border-slate-200">
                        <span className="text-[10px] uppercase font-bold font-oswald text-slate-400 block leading-none">Current Total</span>
                        <span className="font-oswald font-black text-sm text-[#0B3B17] leading-tight block">
                          {displayPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Live Interactive Calendar */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3">
                  {/* Calendar Month Navigation Header */}
                  <div className="flex items-center justify-between">
                    <h4 className="font-oswald text-base font-bold text-slate-900 uppercase tracking-wide">
                      {calendarMonthDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
                    </h4>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                        aria-label="Previous Month"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                        aria-label="Next Month"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 5-Day Weekday Header (Mon - Fri) */}
                  <div className="grid grid-cols-5 gap-1.5 text-center font-oswald text-xs font-bold uppercase tracking-wider text-slate-600 pb-1.5 border-b border-slate-100">
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                  </div>

                  {/* 5-Day Weekday Cells Grid */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {calendarDays.map((d, index) => {
                      const assignedLocId = selectedDatesMap[d.dateStr];
                      const isSelected = Boolean(assignedLocId);
                      const locIdx = userLocations.findIndex((l) => l.id === assignedLocId);
                      const accent =
                        isSelected && locIdx >= 0
                          ? LOCATION_ACCENTS[locIdx % LOCATION_ACCENTS.length]
                          : LOCATION_ACCENTS[0];

                      return (
                        <button
                          key={`${d.dateStr}-${index}`}
                          type="button"
                          disabled={d.isPast}
                          title={d.isPast ? "Past date" : undefined}
                          onClick={() => handleToggleCalendarDate(d.dateStr)}
                          className={cn(
                            "h-11 sm:h-12 rounded-xl text-xs font-bold transition-all relative flex flex-col items-center justify-center select-none",
                            d.isPast
                              ? "opacity-25 bg-slate-50 text-slate-400 cursor-not-allowed border border-transparent"
                              : isSelected
                              ? `${accent.bg} text-white shadow-sm ring-2 ${accent.ring} cursor-pointer scale-[1.02]`
                              : d.isCurrentMonth
                              ? "bg-slate-50/80 text-slate-800 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200/60 cursor-pointer"
                              : "bg-slate-50/30 text-slate-400 hover:bg-slate-100 border border-transparent cursor-pointer"
                          )}
                        >
                          <span className={cn("leading-none", isSelected ? "text-white font-black text-sm" : "")}>
                            {d.dayNum}
                          </span>

                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white mt-1 shrink-0 animate-pulse" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Grouped Delivery Breakdown */}
                {groupedLocations.length > 0 && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold font-oswald uppercase tracking-wider text-slate-800">
                        Assigned Delivery Locations ({groupedLocations.length})
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">
                        Total {selectedDatesCount} meals scheduled
                      </span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {groupedLocations.map((grp) => (
                        <div
                          key={grp.locationId}
                          className={cn(
                            "p-2.5 rounded-xl border bg-white space-y-2 shadow-3xs",
                            grp.color.border
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", grp.color.bg)} />
                              <span className="text-xs font-bold text-slate-800 truncate">
                                {grp.location?.address || "Delivery Address"}
                              </span>
                            </div>
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[10.5px] font-black font-oswald uppercase shrink-0",
                                grp.color.light
                              )}
                            >
                              {grp.dates.length} Days
                            </span>
                          </div>

                          {/* Date chips */}
                          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
                            {grp.dates.map((dStr) => (
                              <div
                                key={dStr}
                                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-2 py-1 rounded-lg text-[11px] font-medium"
                              >
                                <span>{formatFriendlyDate(dStr)}</span>
                                {userLocations.length > 1 && (
                                  <select
                                    value={grp.locationId}
                                    onChange={(e) => handleChangeDateLocation(dStr, e.target.value)}
                                    className="text-[10px] font-semibold bg-white border border-slate-200 rounded px-1 py-0.5 cursor-pointer text-slate-700"
                                    title="Switch location for this date"
                                  >
                                    {userLocations.map((uloc, uidx) => (
                                      <option key={uloc.id} value={uloc.id}>
                                        📍 {LOCATION_ACCENTS[uidx % LOCATION_ACCENTS.length].tag}: {uloc.address.slice(0, 18)}...
                                      </option>
                                    ))}
                                  </select>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleToggleCalendarDate(dStr)}
                                  className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                  title="Remove date"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ══════════════════════════════════════════════════════════════
                  FIXED PLAN: SINGLE DELIVERY ADDRESS BOX
                 ══════════════════════════════════════════════════════════════ */
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5">
                {/* 100% Verified Profile Recipient Card */}
                <div className="p-3 bg-emerald-50/80 border border-emerald-200/90 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white border border-emerald-300 flex items-center justify-center shrink-0 text-[#28B454]">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-950 font-oswald uppercase truncate">
                          {profFirstName} {profLastName}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-200 text-[#0B3B17] text-[9.5px] font-black font-oswald uppercase tracking-wider shrink-0">
                          ✓ 100% Profile Verified
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-800 font-medium truncate block">
                        {profPhone} • {user?.email}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep("PROFILE_REQUIRED")}
                    className="text-[10px] font-bold font-oswald uppercase tracking-wider text-[#28B454] hover:underline shrink-0 cursor-pointer"
                  >
                    Edit Profile
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-bold font-oswald uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#28B454]" />
                    <span>Delivery Address</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setStep("SET_LOCATION")}
                    className="text-[11px] font-bold font-oswald uppercase tracking-wider text-[#28B454] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Address</span>
                  </button>
                </div>

                {userLocations.length > 1 ? (
                  <select
                    value={selectedLocationId}
                    onChange={(e) => setSelectedLocationId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#28B454] cursor-pointer"
                  >
                    {userLocations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        📍 {loc.address} {loc.is_default ? "(Default)" : ""}
                      </option>
                    ))}
                  </select>
                ) : selectedLocation ? (
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-[#28B454] shrink-0" />
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {selectedLocation.address}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep("SET_LOCATION")}
                      className="text-[10.5px] font-bold text-slate-500 hover:text-slate-800 shrink-0 uppercase font-oswald"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-center justify-between gap-2">
                    <span className="text-xs text-amber-800 font-medium">No delivery location found.</span>
                    <button
                      type="button"
                      onClick={() => setStep("SET_LOCATION")}
                      className="text-xs font-bold text-[#28B454] uppercase font-oswald hover:underline"
                    >
                      Set Location Now &rarr;
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Auto-Renewal Toggle */}
            <div
              onClick={() => setAutoRenew(!autoRenew)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 shadow-3xs ${
                autoRenew
                  ? "bg-emerald-50/70 border-[#28B454]/50 ring-1 ring-[#28B454]/20"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <RefreshCw className={`w-3.5 h-3.5 ${autoRenew ? "text-[#28B454] animate-spin-reverse" : "text-slate-400"}`} />
                  <span className="text-xs sm:text-sm font-bold text-slate-900 font-oswald uppercase tracking-wide">
                    Auto-Renew Subscription
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      autoRenew
                        ? "bg-[#28B454]/15 text-[#28B454]"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {autoRenew ? "ON (True)" : "OFF (False)"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {autoRenew
                    ? "Plan will automatically renew at billing cycle end. You can cancel anytime."
                    : "Single billing cycle only. Will not renew automatically."}
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={autoRenew}
                onClick={(e) => {
                  e.stopPropagation();
                  setAutoRenew(!autoRenew);
                }}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer shrink-0 ${
                  autoRenew ? "bg-[#28B454]" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm flex items-center justify-center ${
                    autoRenew ? "translate-x-6" : "translate-x-0"
                  }`}
                >
                  {autoRenew && <Check className="w-3 h-3 text-[#28B454]" />}
                </div>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-700 text-xs font-bold font-oswald uppercase hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  (!isCustomPlan && !selectedLocationId) ||
                  (isCustomPlan && selectedDatesCount < defaultDays)
                }
                className="flex-1 py-3.5 rounded-2xl bg-[#0B3B17] hover:bg-[#124D20] text-white text-xs sm:text-sm font-bold font-oswald uppercase tracking-wider transition-all shadow-md shadow-[#0B3B17]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isCustomPlan && selectedDatesCount < defaultDays ? (
                  <span>
                    SELECT MINIMUM {defaultDays} DAYS ({defaultDays - selectedDatesCount} MORE REQUIRED)
                  </span>
                ) : (
                  <>
                    <span>REVIEW &amp; CONFIRM DETAILS ({displayPrice})</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#36D068]" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ─── STEP 2: SUBSCRIPTION CONFIRMATION POPUP / SCREEN ─── */}
        {step === "CONFIRMATION" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* 1. Subscribed Package & Plan Hero Card */}
            <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-950 to-[#0B3B17] text-white rounded-2xl sm:rounded-3xl border border-emerald-800/40 relative overflow-hidden shadow-lg">
              <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-[#36D068]/15 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-start justify-between gap-3 relative z-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-[#36D068]/20 border border-[#36D068]/40 px-2.5 py-0.5 rounded-full text-[#36D068] font-oswald text-[10px] font-bold uppercase tracking-wider mb-2">
                    <PackageIcon className="w-3 h-3" />
                    <span>{packageName || "MEAL PLAN"}</span>
                  </div>
                  <h4 className="font-oswald text-xl sm:text-2xl font-black uppercase text-white tracking-tight leading-tight">
                    {planName || "Subscription Plan"}
                  </h4>
                  <p className="text-emerald-200/90 text-xs mt-1 font-medium">
                    {isCustomPlan
                      ? additionalDays > 0
                        ? `${selectedDatesCount} Custom Scheduled Meals (${defaultDays} Base + ${additionalDays} Extra Days) • Multi-Location Support`
                        : `${selectedDatesCount} Custom Scheduled Meals • Multi-Location Support`
                      : `${durationLimit || (planName.toLowerCase().includes("monthly") ? 20 : 5)} Weekday Morning Breakfast Meals`}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-oswald uppercase tracking-wider text-emerald-300 block font-bold">
                    Total Payable
                  </span>
                  <span className="font-oswald text-2xl sm:text-3xl font-black text-[#36D068] leading-none block mt-1">
                    {displayPrice}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Key Subscription Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Delivery Schedule & Frequency */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold font-oswald uppercase tracking-wider">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#28B454]" />
                  <span>Delivery Schedule</span>
                </div>
                <p className="text-xs font-bold text-slate-900 font-poppins">
                  {isCustomPlan
                    ? additionalDays > 0
                      ? `${selectedDatesCount} Selected Weekdays (${defaultDays} Base + ${additionalDays} Extra)`
                      : `${selectedDatesCount} Selected Weekdays (Mon – Fri)`
                    : planName.toLowerCase().includes("weekly")
                    ? "5 Days (Mon – Fri)"
                    : "20 Weekdays (Mon – Fri)"}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Morning Delivery (6:30 AM – 8:30 AM)</span>
                </div>
              </div>

              {/* Price Breakdown / Auto-Renewal Policy */}
              {isCustomPlan ? (
                <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold font-oswald uppercase tracking-wider">
                    <CreditCard className="w-3.5 h-3.5 text-[#28B454]" />
                    <span>Price Breakdown</span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-700">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Base Plan ({defaultDays} Days):</span>
                      <span className="font-semibold text-slate-800">
                        {`LKR ${basePriceNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </span>
                    </div>
                    {additionalDays > 0 && (
                      <div className="flex justify-between items-center text-emerald-700 font-medium">
                        <span>Extra Days ({additionalDays} × {`LKR ${dayPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}):</span>
                        <span className="font-bold">+{`LKR ${additionalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200 font-bold text-slate-900">
                      <span>Total:</span>
                      <span className="text-[#0B3B17] font-black">{displayPrice}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold font-oswald uppercase tracking-wider">
                    <RefreshCw className="w-3.5 h-3.5 text-[#28B454]" />
                    <span>Renewal Policy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold font-oswald uppercase tracking-wider",
                        autoRenew
                          ? "bg-emerald-100 text-[#0B3B17] border border-emerald-300"
                          : "bg-slate-200 text-slate-700"
                      )}
                    >
                      {autoRenew ? "Auto-Renew ON" : "Single Term Only"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {autoRenew
                      ? "Renews automatically at billing cycle end. Cancel anytime."
                      : "No recurring charges. Plan expires after deliveries."}
                  </p>
                </div>
              )}
            </div>

            {/* Verified Recipient Summary */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold font-oswald uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#28B454]" />
                  <span>Verified Recipient &amp; Contact</span>
                </span>
                <span className="text-[10px] font-oswald font-bold uppercase tracking-wider text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ✓ 100% Profile Fulfilled
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-bold text-slate-900 block font-oswald uppercase">
                    {profFirstName} {profLastName}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {profPhone} • {user?.email}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  📍 {billingProfile?.city || profCity}
                </div>
              </div>
            </div>

            {/* 3. Delivery Address / Locations Breakdown */}
            <div className="p-3.5 sm:p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold font-oswald uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#28B454]" />
                  <span>{isCustomPlan ? "Assigned Delivery Locations" : "Delivery Address"}</span>
                </span>
                <span className="text-[10px] font-oswald font-bold uppercase tracking-wider text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Doorstep Delivery
                </span>
              </div>

              {isCustomPlan ? (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {groupedLocations.map((grp) => (
                    <div
                      key={grp.locationId}
                      className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={cn("w-2 h-2 rounded-full shrink-0", grp.color.bg)} />
                          <span className="text-xs font-semibold text-slate-800 truncate">
                            {grp.location?.address || "Delivery Address"}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold font-oswald uppercase text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                          {grp.dates.length} Days
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {grp.dates.map((dStr) => (
                          <span
                            key={dStr}
                            className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium"
                          >
                            {formatFriendlyDate(dStr)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedLocation ? (
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-[#28B454]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {selectedLocation.address}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Free doorstep morning delivery to your address
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-amber-700">No delivery address selected.</p>
              )}
            </div>

            {/* 4. Payment Gateway & Security Notice */}
            <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex items-center gap-3 text-xs text-[#0B3B17]">
              <ShieldCheck className="w-5 h-5 text-[#28B454] shrink-0" />
              <div className="leading-snug">
                <span className="font-bold font-oswald uppercase tracking-wide block">
                  PayHere Secure Preapproval Checkout
                </span>
                <span className="text-[11px] text-slate-600">
                  You will be redirected to PayHere (Visa, MasterCard, Amex) to securely authorize your subscription payment.
                </span>
              </div>
            </div>

            {/* 5. Action Buttons */}
            <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-100">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setStep("CHECKOUT")}
                className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-700 text-xs font-bold font-oswald uppercase hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back / Edit</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalPayHereCheckout}
                className="flex-1 py-3.5 rounded-2xl bg-[#0B3B17] hover:bg-[#124D20] text-white text-xs sm:text-sm font-bold font-oswald uppercase tracking-wider transition-all shadow-md shadow-[#0B3B17]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{submittingStep || "Redirecting to PayHere..."}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-[#36D068]" />
                    <span>CONFIRM &amp; PAY ({displayPrice})</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#36D068]" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
