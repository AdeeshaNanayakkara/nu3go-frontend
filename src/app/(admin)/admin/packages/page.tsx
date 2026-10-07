"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  packageService,
  type PackageItem,
  type PlanWithPrice,
  type SubscriptionPlanItem,
} from "@/services/api/package.service";
import {
  mealService,
  type MealItem,
} from "@/services/api/meal.service";
import {
  menuService,
  type MenuItem,
  type MenuMealSlot,
  type MenuDay,
} from "@/services/api/menu.service";
import type { PaginationMeta } from "@/services/api/admin.service";
import { formatUserFriendlyError } from "@/utils/response-handler";
import { cn } from "@/lib/utils";
import {
  Package as PackageIcon,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  Calendar,
  Check,
  Tag,
  UtensilsCrossed,
  Upload,
  CheckCircle2,
  GripVertical,
  ArrowLeft,
  ShieldAlert,
  Sparkles,
  FolderOpen,
} from "lucide-react";

export default function AdminPackagesPage() {
  // ─── PACKAGES STATE ───
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    has_next: false,
    has_prev: false,
    limit: 12,
    page: 1,
    total_pages: 1,
    total_rows: 0,
  });
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [packageError, setPackageError] = useState<string | null>(null);

  // Package Filter & Search states
  const [packageSearchTerm, setPackageSearchTerm] = useState("");
  const [packageStatusFilter, setPackageStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [packagePage, setPackagePage] = useState(1);
  const [packageLimit, setPackageLimit] = useState(12);

  // Add / Edit Package Modal state
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageItem | null>(null);
  const [formPackageName, setFormPackageName] = useState("");
  const [formPackageDescription, setFormPackageDescription] = useState("");
  const [formPackageIsActive, setFormPackageIsActive] = useState(true);
  const [selectedPlansMap, setSelectedPlansMap] = useState<Record<string, { price: number | ""; return_price: number | "" }>>({});
  const [createModalPlans, setCreateModalPlans] = useState<SubscriptionPlanItem[]>([]);
  const [isSavingPackage, setIsSavingPackage] = useState(false);
  const [packageModalError, setPackageModalError] = useState<string | null>(null);

  // Delete Package Modal state
  const [deletingPackage, setDeletingPackage] = useState<PackageItem | null>(null);
  const [isDeletingPackage, setIsDeletingPackage] = useState(false);

  // Assign / Manage Plans Modal state
  const [managingPackage, setManagingPackage] = useState<PackageItem | null>(null);
  const [assignedPlans, setAssignedPlans] = useState<PlanWithPrice[]>([]);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlanItem[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [plansModalError, setPlansModalError] = useState<string | null>(null);

  // Assign New Plan form state
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [newPlanPrice, setNewPlanPrice] = useState<number | "">("");
  const [newPlanReturnPrice, setNewPlanReturnPrice] = useState<number | "">(0);
  const [isAssigningPlan, setIsAssigningPlan] = useState(false);

  // Update Plan Price state
  const [editingPlanPriceId, setEditingPlanPriceId] = useState<string | null>(null);
  const [editPriceVal, setEditPriceVal] = useState<number | "">("");
  const [editReturnPriceVal, setEditReturnPriceVal] = useState<number | "">(0);
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);


  // ─── MEALS STATE (RIGHT SIDEBAR PANEL) ───
  const [allMeals, setAllMeals] = useState<MealItem[]>([]);
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [isLoadingMeals, setIsLoadingMeals] = useState(true);
  const [mealsError, setMealsError] = useState<string | null>(null);
  const [mealFilterMode, setMealFilterMode] = useState<string>("all"); // "all" | "unassigned" | packageId
  const [mealSearchTerm, setMealSearchTerm] = useState("");

  // Map of meal_id -> MealItem for fast lookup in menu slots (uses full catalog)
  const mealsMap = useMemo(() => {
    const map = new Map<string, MealItem>();
    allMeals.forEach((m) => map.set(m.id, m));
    return map;
  }, [allMeals]);

  // Add / Edit Meal Modal state
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealItem | null>(null);
  const [mealFormName, setMealFormName] = useState("");
  const [mealFormDescription, setMealFormDescription] = useState("");
  const [mealFormImageUrl, setMealFormImageUrl] = useState("");
  const [mealSelectedFile, setMealSelectedFile] = useState<File | null>(null);
  const [mealImagePreview, setMealImagePreview] = useState<string | null>(null);
  const [isUploadingMealImage, setIsUploadingMealImage] = useState(false);
  const [mealUploadSuccess, setMealUploadSuccess] = useState(false);
  const [isSavingMeal, setIsSavingMeal] = useState(false);
  const [mealModalError, setMealModalError] = useState<string | null>(null);

  // Delete Meal Modal state
  const [deletingMeal, setDeletingMeal] = useState<MealItem | null>(null);
  const [isDeletingMeal, setIsDeletingMeal] = useState(false);


  // ─── MENUS MANAGEMENT & IN-PLACE BUILDER STATE ───
  const [selectedPackageForMenus, setSelectedPackageForMenus] = useState<PackageItem | null>(null);
  const [packageMenus, setPackageMenus] = useState<MenuItem[]>([]);
  const [isLoadingMenus, setIsLoadingMenus] = useState(false);
  const [menusError, setMenusError] = useState<string | null>(null);

  // Active Menu being built / edited in-place
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [menuFormName, setMenuFormName] = useState("");
  const [menuFormSequence, setMenuFormSequence] = useState<number>(1);
  const [draggedMenuId, setDraggedMenuId] = useState<string | null>(null);
  const [isSavingMenu, setIsSavingMenu] = useState(false);
  const [menuBuilderError, setMenuBuilderError] = useState<string | null>(null);

  // Days definition
  const DAYS: { key: MenuDay; label: string }[] = [
    { key: "MONDAY", label: "Mon" },
    { key: "TUESDAY", label: "Tue" },
    { key: "WEDNESDAY", label: "Wed" },
    { key: "THURSDAY", label: "Thu" },
    { key: "FRIDAY", label: "Fri" },
  ];

  type SlotType = "meal_id" | "optional_meal_id" | "emergency_meal_change_id" | "emergency_optional_meal_change_id";

  const emptySlots = (): Record<MenuDay, Record<SlotType, string>> => ({
    MONDAY: { meal_id: "", optional_meal_id: "", emergency_meal_change_id: "", emergency_optional_meal_change_id: "" },
    TUESDAY: { meal_id: "", optional_meal_id: "", emergency_meal_change_id: "", emergency_optional_meal_change_id: "" },
    WEDNESDAY: { meal_id: "", optional_meal_id: "", emergency_meal_change_id: "", emergency_optional_meal_change_id: "" },
    THURSDAY: { meal_id: "", optional_meal_id: "", emergency_meal_change_id: "", emergency_optional_meal_change_id: "" },
    FRIDAY: { meal_id: "", optional_meal_id: "", emergency_meal_change_id: "", emergency_optional_meal_change_id: "" },
  });

  const [menuSlots, setMenuSlots] = useState<Record<MenuDay, Record<SlotType, string>>>(emptySlots);

  // Toggle state to show emergency meal slots on demand per day
  const [showEmergencySlots, setShowEmergencySlots] = useState<Record<MenuDay, boolean>>({
    MONDAY: false,
    TUESDAY: false,
    WEDNESDAY: false,
    THURSDAY: false,
    FRIDAY: false,
  });

  // Delete Menu state
  const [deletingMenu, setDeletingMenu] = useState<MenuItem | null>(null);
  const [isDeletingMenu, setIsDeletingMenu] = useState(false);

  // System Toast Notification State
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showToast = useCallback((text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);


  // ─── API FETCH HANDLERS ───

  // Fetch Packages from API
  const fetchPackages = useCallback(async () => {
    setIsLoadingPackages(true);
    setPackageError(null);
    try {
      const result = await packageService.getPackages({
        page: packagePage,
        limit: packageLimit,
        search: packageSearchTerm || undefined,
        is_active:
          packageStatusFilter === "active"
            ? true
            : packageStatusFilter === "inactive"
              ? false
              : undefined,
      });

      setPackages(result.packages);
      setPagination(result.pagination);
    } catch (err: unknown) {
      console.error("[AdminPackagesPage] Error fetching packages:", err);
      setPackageError(
        formatUserFriendlyError(err, { fallback: "Failed to load packages catalog." })
      );
    } finally {
      setIsLoadingPackages(false);
    }
  }, [packagePage, packageLimit, packageSearchTerm, packageStatusFilter]);

  // Fetch Meals based on selected filter
  const fetchMeals = useCallback(async () => {
    setIsLoadingMeals(true);
    setMealsError(null);
    try {
      // Always fetch complete meals catalog for slot resolution in Menu Builder
      const fullRes = await mealService.getMeals({ limit: 100 });
      const fullCatalog = fullRes.meals || [];
      setAllMeals(fullCatalog);

      // Filter subset strictly for the right-hand Meal List sidebar
      let loadedMeals: MealItem[] = [];
      if (mealFilterMode === "unassigned") {
        loadedMeals = await mealService.getUnassignedMeals();
      } else if (mealFilterMode !== "all") {
        loadedMeals = await mealService.getMealsByPackageId(mealFilterMode);
      } else {
        loadedMeals = fullCatalog;
      }

      if (mealSearchTerm.trim()) {
        const term = mealSearchTerm.toLowerCase();
        loadedMeals = loadedMeals.filter(
          (m) =>
            m.name.toLowerCase().includes(term) ||
            (m.description && m.description.toLowerCase().includes(term))
        );
      }

      setMeals(loadedMeals);
    } catch (err: unknown) {
      console.error("[AdminPackagesPage] Error fetching meals:", err);
      setMealsError(
        formatUserFriendlyError(err, { fallback: "Failed to load meals catalog." })
      );
    } finally {
      setIsLoadingMeals(false);
    }
  }, [mealFilterMode, mealSearchTerm]);

  // Fetch Menus for selected Package
  const fetchPackageMenus = useCallback(async (packageId: string) => {
    setIsLoadingMenus(true);
    setMenusError(null);
    try {
      const menus = await menuService.getMenus(packageId);
      setPackageMenus(menus);

      // Auto-select first menu if available, or prepare new menu
      if (menus.length > 0) {
        selectMenuToEdit(menus[0]);
      } else {
        prepareNewMenu();
      }
    } catch (err: unknown) {
      console.error("[AdminPackagesPage] Error fetching package menus:", err);
      setMenusError(
        err instanceof Error ? err.message : "Failed to load menus for package."
      );
    } finally {
      setIsLoadingMenus(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  // Listen for browser navigation (Back / Forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === "undefined") return;
      const urlParams = new URLSearchParams(window.location.search);
      const pkgId = urlParams.get("packageId");

      if (!pkgId) {
        setSelectedPackageForMenus(null);
      } else if (packages.length > 0) {
        const matchingPkg = packages.find((p) => p.id === pkgId);
        if (matchingPkg) {
          setSelectedPackageForMenus(matchingPkg);
          fetchPackageMenus(matchingPkg.id);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [packages, fetchPackageMenus]);

  // Sync package selection on initial load if packageId query parameter exists
  useEffect(() => {
    if (typeof window === "undefined" || packages.length === 0) return;
    const urlParams = new URLSearchParams(window.location.search);
    const pkgId = urlParams.get("packageId");
    if (pkgId && (!selectedPackageForMenus || selectedPackageForMenus.id !== pkgId)) {
      const matchingPkg = packages.find((p) => p.id === pkgId);
      if (matchingPkg) {
        setSelectedPackageForMenus(matchingPkg);
        fetchPackageMenus(matchingPkg.id);
      }
    }
  }, [packages, fetchPackageMenus, selectedPackageForMenus]);


  // ─── PACKAGE MODAL HANDLERS ───

  const handleOpenCreatePackageModal = async () => {
    setEditingPackage(null);
    setFormPackageName("");
    setFormPackageDescription("");
    setFormPackageIsActive(true);
    setSelectedPlansMap({});
    setPackageModalError(null);
    setIsPackageModalOpen(true);

    try {
      const plans = await packageService.getSubscriptionPlans();
      setCreateModalPlans(plans);
      if (plans.length > 0) {
        setSelectedPlansMap({
          [plans[0].id]: { price: "", return_price: 0 },
        });
      }
    } catch (err) {
      console.error("[AdminPackagesPage] Fetch create modal plans error:", err);
    }
  };

  const handleToggleCreatePlanSelection = (planId: string, checked: boolean) => {
    setSelectedPlansMap((prev) => {
      const updated = { ...prev };
      if (checked) {
        updated[planId] = { price: "", return_price: 0 };
      } else {
        delete updated[planId];
      }
      return updated;
    });
  };

  const handleCreatePlanPriceChange = (planId: string, value: string) => {
    const numVal = value ? Number(value) : "";
    setSelectedPlansMap((prev) => ({
      ...prev,
      [planId]: {
        ...prev[planId],
        price: numVal,
      },
    }));
  };

  const handleOpenEditPackageModal = (pkg: PackageItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingPackage(pkg);
    setFormPackageName(pkg.name);
    setFormPackageDescription(pkg.description || "");
    setFormPackageIsActive(pkg.is_active ?? true);
    setPackageModalError(null);
    setIsPackageModalOpen(true);
  };

  const handlePackageFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formPackageName.trim()) {
      setPackageModalError("Package name is required.");
      return;
    }

    if (!editingPackage) {
      const planEntries = Object.entries(selectedPlansMap);
      if (planEntries.length === 0) {
        setPackageModalError("Please select at least one subscription plan to assign to this package.");
        return;
      }
      for (const [pId, pData] of planEntries) {
        if (pData.price === "" || Number(pData.price) <= 0) {
          const planObj = createModalPlans.find((p) => p.id === pId);
          setPackageModalError(`Please enter a valid Package Price for ${planObj?.name || "the selected plan"}.`);
          return;
        }
      }
    }

    setIsSavingPackage(true);
    setPackageModalError(null);

    try {
      if (editingPackage) {
        await packageService.updatePackage(editingPackage.id, {
          name: formPackageName.trim(),
          description: formPackageDescription.trim(),
          is_active: formPackageIsActive,
        });
      } else {
        const plansPayload = Object.entries(selectedPlansMap).map(([pId, pData]) => ({
          plan_id: pId,
          price: Number(pData.price),
          return_price: Number(pData.return_price) || 0,
        }));

        await packageService.createPackage({
          name: formPackageName.trim(),
          description: formPackageDescription.trim(),
          is_active: formPackageIsActive,
          plans: plansPayload,
        });
      }

      setIsPackageModalOpen(false);
      showToast(editingPackage ? "Package updated successfully!" : "Package created successfully!", "success");
      fetchPackages();
    } catch (err: unknown) {
      console.error("[AdminPackagesPage] Package save error:", err);
      setPackageModalError(formatUserFriendlyError(err, { fallback: "Failed to save package." }));
    } finally {
      setIsSavingPackage(false);
    }
  };

  const handleDeletePackageConfirm = async () => {
    if (!deletingPackage) return;
    setIsDeletingPackage(true);
    try {
      await packageService.deletePackage(deletingPackage.id);
      if (selectedPackageForMenus?.id === deletingPackage.id) {
        setSelectedPackageForMenus(null);
      }
      setDeletingPackage(null);
      showToast("Package deleted successfully!", "success");
      fetchPackages();
    } catch (err: unknown) {
      console.error("[AdminPackagesPage] Delete package error:", err);
      showToast(formatUserFriendlyError(err, { fallback: "Failed to delete package." }), "error");
    } finally {
      setIsDeletingPackage(false);
    }
  };

  // Manage Plans Handlers
  const handleOpenManagePlans = async (pkg: PackageItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setManagingPackage(pkg);
    setIsLoadingPlans(true);
    setPlansModalError(null);
    setSelectedPlanId("");
    setNewPlanPrice("");
    setNewPlanReturnPrice(0);
    setEditingPlanPriceId(null);

    try {
      const [assigned, available] = await Promise.all([
        packageService.getAssignedPlans(pkg.id),
        packageService.getSubscriptionPlans(),
      ]);
      setAssignedPlans(assigned);
      setAvailablePlans(available);
    } catch (err: unknown) {
      console.error("[AdminPackagesPage] Fetch plans error:", err);
      setPlansModalError("Failed to load plans for this package.");
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const unassignedSubscriptionPlans = useMemo(() => {
    const assignedPlanIds = new Set(assignedPlans.map((p) => p.plan_id));
    return availablePlans.filter((p) => !assignedPlanIds.has(p.id));
  }, [assignedPlans, availablePlans]);

  const handleAssignPlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingPackage || !selectedPlanId) return;
    if (newPlanPrice === "" || Number(newPlanPrice) <= 0) {
      setPlansModalError("Please enter a valid price for the plan.");
      return;
    }

    setIsAssigningPlan(true);
    setPlansModalError(null);

    try {
      await packageService.assignPlanToPackage(
        managingPackage.id,
        selectedPlanId,
        Number(newPlanPrice),
        Number(newPlanReturnPrice) || 0
      );

      const updatedAssigned = await packageService.getAssignedPlans(managingPackage.id);
      setAssignedPlans(updatedAssigned);
      setSelectedPlanId("");
      setNewPlanPrice("");
      setNewPlanReturnPrice(0);
      fetchPackages();
    } catch (err: unknown) {
      console.error("[AdminPackagesPage] Assign plan error:", err);
      setPlansModalError(formatUserFriendlyError(err, { fallback: "Failed to assign plan." }));
    } finally {
      setIsAssigningPlan(false);
    }
  };

  const handleUnassignPlan = async (planId: string) => {
    if (!managingPackage) return;
    setPlansModalError(null);
    try {
      await packageService.unassignPlanFromPackage(managingPackage.id, planId);
      const updatedAssigned = await packageService.getAssignedPlans(managingPackage.id);
      setAssignedPlans(updatedAssigned);
      fetchPackages();
    } catch (err: unknown) {
      console.error("[AdminPackagesPage] Unassign plan error:", err);
      setPlansModalError(formatUserFriendlyError(err, { fallback: "Failed to unassign plan." }));
    }
  };

  const handleStartEditPrice = (plan: PlanWithPrice) => {
    setEditingPlanPriceId(plan.plan_id);
    setEditPriceVal(plan.price);
    setEditReturnPriceVal(plan.return_price || 0);
  };

  const handleSavePrice = async (planId: string) => {
    if (!managingPackage) return;
    if (editPriceVal === "" || Number(editPriceVal) <= 0) {
      setPlansModalError("Price must be a positive number.");
      return;
    }

    setIsUpdatingPrice(true);
    setPlansModalError(null);

    try {
      await packageService.updatePlanPrice(
        managingPackage.id,
        planId,
        Number(editPriceVal),
        Number(editReturnPriceVal) || 0
      );

      const updatedAssigned = await packageService.getAssignedPlans(managingPackage.id);
      setAssignedPlans(updatedAssigned);
      setEditingPlanPriceId(null);
      fetchPackages();
    } catch (err: unknown) {
      console.error("[AdminPackagesPage] Update price error:", err);
      setPlansModalError(formatUserFriendlyError(err, { fallback: "Failed to update plan price." }));
    } finally {
      setIsUpdatingPrice(false);
    }
  };


  // ─── MEAL MODAL HANDLERS ───

  const handleOpenCreateMealModal = () => {
    setEditingMeal(null);
    setMealFormName("");
    setMealFormDescription("");
    setMealFormImageUrl("");
    setMealSelectedFile(null);
    setMealImagePreview(null);
    setMealUploadSuccess(false);
    setMealModalError(null);
    setIsMealModalOpen(true);
  };

  const handleOpenEditMealModal = (meal: MealItem) => {
    setEditingMeal(meal);
    setMealFormName(meal.name);
    setMealFormDescription(meal.description || "");
    setMealFormImageUrl(meal.image_url || "");
    setMealSelectedFile(null);
    setMealImagePreview(meal.image_url || null);
    setMealUploadSuccess(false);
    setMealModalError(null);
    setIsMealModalOpen(true);
  };

  const handleMealFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMealSelectedFile(file);
    setMealImagePreview(URL.createObjectURL(file));
    setMealModalError(null);
    setMealUploadSuccess(false);
    setIsUploadingMealImage(true);

    try {
      const uploadedUrl = await mealService.uploadMealImage(file);
      setMealFormImageUrl(uploadedUrl);
      setMealUploadSuccess(true);
    } catch (err: unknown) {
      console.error("[AdminPackagesPage] Image upload failed:", err);
      setMealModalError(
        err instanceof Error ? err.message : "Failed to upload meal image."
      );
    } finally {
      setIsUploadingMealImage(false);
    }
  };

  const handleMealFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mealFormName.trim()) {
      setMealModalError("Meal name is required.");
      return;
    }

    if (isUploadingMealImage) {
      setMealModalError("Please wait for image upload to complete.");
      return;
    }

    setIsSavingMeal(true);
    setMealModalError(null);

    try {
      const payload = {
        name: mealFormName.trim(),
        description: mealFormDescription.trim(),
        image_url: mealFormImageUrl.trim() || undefined,
      };

      if (editingMeal) {
        await mealService.updateMeal(editingMeal.id, payload);
      } else {
        await mealService.createMeal(payload);
      }

      setIsMealModalOpen(false);
      showToast(editingMeal ? "Meal updated successfully!" : "Meal created successfully!", "success");
      fetchMeals();
    } catch (err: unknown) {
      console.error("[AdminPackagesPage] Meal save error:", err);
      setMealModalError(
        err instanceof Error ? err.message : "Failed to save meal."
      );
    } finally {
      setIsSavingMeal(false);
    }
  };

  const handleDeleteMealConfirm = async () => {
    if (!deletingMeal) return;
    setIsDeletingMeal(true);
    try {
      await mealService.deleteMeal(deletingMeal.id);
      setDeletingMeal(null);
      showToast("Meal deleted successfully!", "success");
      fetchMeals();
    } catch (err: unknown) {
      console.error("[AdminPackagesPage] Delete meal error:", err);
      showToast(err instanceof Error ? err.message : "Failed to delete meal.", "error");
    } finally {
      setIsDeletingMeal(false);
    }
  };


  // ─── IN-PLACE MENU WORKSPACE HANDLERS ───

  // Clicking on a Package Card selects it and transitions the left column to the Menu Workspace
  const handleSelectPackageForMenus = (pkg: PackageItem, pushHistory = true) => {
    setSelectedPackageForMenus(pkg);
    fetchPackageMenus(pkg.id);
    if (pushHistory && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("packageId", pkg.id);
      window.history.pushState({ packageId: pkg.id }, "", url.toString());
    }
  };

  const handleBackToPackagesList = () => {
    setSelectedPackageForMenus(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.has("packageId")) {
        url.searchParams.delete("packageId");
        window.history.pushState({}, "", url.toString());
      }
    }
  };

  const prepareNewMenu = () => {
    setEditingMenu(null);
    setMenuFormName(`Standard Week ${packageMenus.length + 1}`);
    setMenuFormSequence(packageMenus.length + 1);
    setMenuSlots(emptySlots());
    setMenuBuilderError(null);
    setShowEmergencySlots({
      MONDAY: false,
      TUESDAY: false,
      WEDNESDAY: false,
      THURSDAY: false,
      FRIDAY: false,
    });
  };

  const selectMenuToEdit = (menu: MenuItem) => {
    setEditingMenu(menu);
    setMenuFormName(menu.name);
    setMenuFormSequence(menu.sequence ?? 1);

    const newSlots = emptySlots();
    const newEmergencyShows = {
      MONDAY: false,
      TUESDAY: false,
      WEDNESDAY: false,
      THURSDAY: false,
      FRIDAY: false,
    };

    if (menu.meals && Array.isArray(menu.meals)) {
      menu.meals.forEach((slot) => {
        if (slot.day && newSlots[slot.day]) {
          newSlots[slot.day].meal_id = slot.meal_id || "";
          newSlots[slot.day].optional_meal_id = slot.optional_meal_id || "";
          newSlots[slot.day].emergency_meal_change_id = slot.emergency_meal_change_id || "";
          newSlots[slot.day].emergency_optional_meal_change_id = slot.emergency_optional_meal_change_id || "";

          // If emergency meals exist on this slot, automatically expand emergency boxes
          if (slot.emergency_meal_change_id || slot.emergency_optional_meal_change_id) {
            newEmergencyShows[slot.day] = true;
          }
        }
      });
    }

    setMenuSlots(newSlots);
    setShowEmergencySlots(newEmergencyShows);
    setMenuBuilderError(null);
  };

  const handleDropMealOnSlot = (day: MenuDay, slotType: SlotType, e: React.DragEvent) => {
    e.preventDefault();
    const droppedMealId = e.dataTransfer.getData("meal_id") || e.dataTransfer.getData("text/plain");
    if (!droppedMealId) return;

    setMenuSlots((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slotType]: droppedMealId,
      },
    }));
  };

  const handleClearSlot = (day: MenuDay, slotType: SlotType) => {
    setMenuSlots((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slotType]: "",
      },
    }));
  };

  const toggleEmergencyForDay = (day: MenuDay) => {
    setShowEmergencySlots((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const handleMenuBuilderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!menuFormName.trim()) {
      setMenuBuilderError("Menu name is required (e.g. Standard Week 1).");
      return;
    }

    if (!selectedPackageForMenus) {
      setMenuBuilderError("No active package selected.");
      return;
    }

    // Validate mandatory main meals for all 5 days (MONDAY..FRIDAY)
    for (const d of DAYS) {
      if (!menuSlots[d.key].meal_id) {
        setMenuBuilderError(`Main Meal (Mandatory) is required for ${d.label} (${d.key}).`);
        return;
      }
    }

    const mealsPayload: MenuMealSlot[] = DAYS.map((d) => {
      const s = menuSlots[d.key];
      const slotObj: MenuMealSlot = {
        day: d.key,
        meal_id: s.meal_id,
      };
      if (s.optional_meal_id?.trim()) {
        slotObj.optional_meal_id = s.optional_meal_id.trim();
      }
      if (s.emergency_meal_change_id?.trim()) {
        slotObj.emergency_meal_change_id = s.emergency_meal_change_id.trim();
      }
      if (s.emergency_optional_meal_change_id?.trim()) {
        slotObj.emergency_optional_meal_change_id = s.emergency_optional_meal_change_id.trim();
      }
      return slotObj;
    });

    setIsSavingMenu(true);
    setMenuBuilderError(null);

    try {
      let saved: MenuItem;
      if (editingMenu) {
        saved = await menuService.updateMenu(editingMenu.id, {
          package_id: selectedPackageForMenus.id,
          name: menuFormName.trim(),
          sequence: Number(menuFormSequence) || 1,
          meals: mealsPayload,
        });
      } else {
        saved = await menuService.createMenu({
          package_id: selectedPackageForMenus.id,
          name: menuFormName.trim(),
          sequence: Number(menuFormSequence) || (packageMenus.length + 1),
          meals: mealsPayload,
        });
      }

      // Refresh package menus and select saved menu
      const updatedMenus = await menuService.getMenus(selectedPackageForMenus.id);
      setPackageMenus(updatedMenus);
      setEditingMenu(saved);
      showToast(editingMenu ? "Menu schedule updated successfully!" : "Menu schedule created successfully!", "success");
    } catch (err: unknown) {
      console.error("[AdminPackagesPage] Save menu error:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to save menu.";
      setMenuBuilderError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setIsSavingMenu(false);
    }
  };

  const handleDeleteMenuConfirm = async () => {
    if (!deletingMenu || !selectedPackageForMenus) return;
    setIsDeletingMenu(true);
    try {
      await menuService.deleteMenu(deletingMenu.id);
      setDeletingMenu(null);
      showToast("Menu deleted successfully!", "success");
      const updated = await menuService.getMenus(selectedPackageForMenus.id);
      setPackageMenus(updated);
      if (updated.length > 0) {
        selectMenuToEdit(updated[0]);
      } else {
        prepareNewMenu();
      }
    } catch (err: unknown) {
      console.error("[AdminPackagesPage] Delete menu error:", err);
      showToast(err instanceof Error ? err.message : "Failed to delete menu.", "error");
    } finally {
      setIsDeletingMenu(false);
    }
  };


  return (
    <div className={cn('flex', 'flex-col', 'h-[calc(100vh-6rem)]', 'min-h-0', 'space-y-3', 'font-poppins', 'text-slate-900', 'overflow-hidden', 'relative')}>
      {/* ─── SYSTEM TOAST NOTIFICATION OVERLAY ─── */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-3 fade-in duration-200 ${toastMessage.type === "success"
              ? "bg-[#36D068] text-white border-[#2ca752]"
              : "bg-red-600 text-white border-red-700"
            }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className={cn('w-4', 'h-4', 'shrink-0', 'text-white')} />
          ) : (
            <AlertCircle className={cn('w-4', 'h-4', 'shrink-0', 'text-white')} />
          )}
          <span>{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className={cn('ml-2', 'p-0.5', 'hover:bg-white/20', 'rounded-lg', 'cursor-pointer')}
          >
            <X className={cn('w-3.5', 'h-3.5')} />
          </button>
        </div>
      )}

      {/* Top Header Banner */}
      <div className={cn('flex', 'flex-col', 'sm:flex-row', 'sm:items-center', 'justify-between', 'gap-4', 'bg-white', 'border', 'border-slate-200/80', 'p-6', 'rounded-3xl', 'shadow-sm', 'shrink-0')}>
        <div>
          <div className={cn('flex', 'items-center', 'gap-2', 'mb-1')}>
            <span className={cn('bg-[#36D068]/15', 'text-[#36D068]', 'text-xs', 'px-3', 'py-1', 'rounded-full', 'font-bold', 'uppercase', 'tracking-wider')}>
              Admin Portal
            </span>
            <span className={cn('text-slate-500', 'text-xs', 'font-medium')}>Catalog & Offerings</span>
          </div>
          <h1 className={cn('text-2xl', 'sm:text-3xl', 'font-bold', 'text-slate-900', 'tracking-tight')}>
            Package & Menu Management
          </h1>
          <p className={cn('text-slate-500', 'text-sm', 'mt-1')}>
            Configure subscription packages, daily menus, and weekly meal plans.
          </p>
        </div>

        <div className={cn('flex', 'items-center', 'gap-3')}>
          <button
            type="button"
            onClick={fetchPackages}
            className={cn('px-4', 'py-2.5', 'rounded-xl', 'border', 'border-slate-200', 'text-slate-600', 'hover:text-slate-900', 'hover:bg-slate-100', 'transition-all', 'cursor-pointer')}
            title="Refresh Packages"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingPackages ? "animate-spin" : ""}`} />
          </button>

          {!selectedPackageForMenus && (
            <button
              type="button"
              onClick={handleOpenCreatePackageModal}
              className={cn('bg-[#36D068]', 'hover:bg-[#2ca752]', 'text-white', 'px-5', 'py-2.5', 'rounded-xl', 'font-semibold', 'text-sm', 'transition-all', 'shadow-sm', 'flex', 'items-center', 'gap-2', 'cursor-pointer', 'shrink-0')}
            >
              <Plus className={cn('w-4', 'h-4')} />
              <span>Add Package</span>
            </button>
          )}
        </div>
      </div>


      {/* ─── MAIN TWO-COLUMN DASHBOARD LAYOUT (INDEPENDENT SCROLLING COLUMNS) ─── */}
      <div className={cn('flex-1', 'min-h-0', 'grid', 'grid-cols-1', 'lg:grid-cols-12', 'gap-5', 'items-stretch', 'overflow-hidden')}>

        {/* ─── LEFT COLUMN WORKSPACE: PACKAGES CATALOG (FULL WIDTH) OR MENU BUILDER WORKSPACE ─── */}
        <div className={`flex flex-col min-h-0 h-full space-y-3 ${selectedPackageForMenus ? "lg:col-span-7 xl:col-span-8" : "lg:col-span-12"
          }`}>

          {selectedPackageForMenus ? (
            /* ═════════════════════════════════════════════════════════════════ */
            /* ─── IN-PLACE MENU MANAGEMENT WORKSPACE FOR SELECTED PACKAGE ─── */
            /* ═════════════════════════════════════════════════════════════════ */
            <div className={cn('bg-white', 'border', 'border-slate-200/80', 'rounded-2xl', 'p-4', 'shadow-xs', 'flex', 'flex-col', 'min-h-0', 'h-full', 'space-y-3')}>

              {/* Menu Workspace Header */}
              <div className={cn('flex', 'items-center', 'justify-between', 'pb-2', 'border-b', 'border-slate-100', 'shrink-0')}>
                <div className={cn('flex', 'items-center', 'gap-3')}>
                  <button
                    type="button"
                    onClick={handleBackToPackagesList}
                    className={cn('p-1.5', 'rounded-xl', 'border', 'border-slate-200', 'hover:bg-slate-100', 'text-slate-600', 'transition-colors', 'flex', 'items-center', 'gap-1', 'text-xs', 'font-bold', 'cursor-pointer')}
                    title="Back to Packages List"
                  >
                    <ArrowLeft className={cn('w-4', 'h-4')} />
                    <span>Packages</span>
                  </button>

                  <div>
                    <div className={cn('flex', 'items-center', 'gap-2')}>
                      <h2 className={cn('text-base', 'font-extrabold', 'text-slate-900', 'leading-none')}>
                        {selectedPackageForMenus.name}
                      </h2>
                      <span className={cn('text-[10px]', 'font-bold', 'bg-[#36D068]/15', 'text-[#2ca752]', 'px-2', 'py-0.5', 'rounded-full')}>
                        Menu Builder
                      </span>
                    </div>
                    <p className={cn('text-[11px]', 'text-slate-400', 'mt-0.5')}>
                      Configure 5-day Mon-Fri weekly meal schedules
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={prepareNewMenu}
                  className={cn('bg-[#36D068]', 'hover:bg-[#2ca752]', 'text-white', 'px-3', 'py-1.5', 'rounded-xl', 'font-semibold', 'text-xs', 'transition-all', 'shadow-xs', 'flex', 'items-center', 'gap-1', 'cursor-pointer', 'shrink-0')}
                >
                  <Plus className={cn('w-3.5', 'h-3.5')} />
                  <span>New Menu</span>
                </button>
              </div>

              {/* Menu Tabs Bar for this Package (Draggable Tab Reordering) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
                {/* Helper label placed in front of menu tab labels (plain text on white background) */}
                {packageMenus.length > 1 && (
                  <span className="text-xs text-slate-500 font-semibold flex items-center gap-1 shrink-0 mr-1 select-none">
                    <GripVertical className="w-3.5 h-3.5 text-[#36D068]" />
                    <span>Drag tabs to reorder:</span>
                  </span>
                )}

                {packageMenus.map((menu, index) => {
                  const isSelected = editingMenu?.id === menu.id;
                  const displaySeq = menu.sequence ?? index + 1;
                  return (
                    <div
                      key={menu.id}
                      role="button"
                      tabIndex={0}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", menu.id);
                        e.dataTransfer.setData("menu_id", menu.id);
                        setDraggedMenuId(menu.id);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={async (e) => {
                        e.preventDefault();
                        const sourceMenuId = e.dataTransfer.getData("menu_id") || draggedMenuId;
                        setDraggedMenuId(null);
                        if (!sourceMenuId || sourceMenuId === menu.id || !selectedPackageForMenus) return;

                        const sourceIdx = packageMenus.findIndex((m) => m.id === sourceMenuId);
                        const targetIdx = packageMenus.findIndex((m) => m.id === menu.id);
                        if (sourceIdx === -1 || targetIdx === -1) return;

                        const updatedList = [...packageMenus];
                        const [movedItem] = updatedList.splice(sourceIdx, 1);
                        updatedList.splice(targetIdx, 0, movedItem);

                        const reorderedList = updatedList.map((m, idx) => ({
                          ...m,
                          sequence: idx + 1,
                        }));

                        setPackageMenus(reorderedList);

                        try {
                          await Promise.all(
                            reorderedList.map((m) =>
                              menuService.updateMenu(m.id, {
                                package_id: selectedPackageForMenus.id,
                                name: m.name,
                                sequence: m.sequence,
                              })
                            )
                          );
                          showToast("Menu positions reordered successfully!", "success");
                        } catch (err) {
                          console.error("[AdminPackagesPage] Error updating menu sequence:", err);
                          showToast(formatUserFriendlyError(err, { fallback: "Failed to update menu position." }), "error");
                        }
                      }}
                      onClick={() => selectMenuToEdit(menu)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") selectMenuToEdit(menu);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-grab active:cursor-grabbing ${isSelected
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200/80 text-slate-700"
                        }`}
                      title="Drag menu tab to reorder sequence"
                    >
                      <GripVertical className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-black ${isSelected ? "bg-slate-700 text-emerald-300" : "bg-slate-200 text-slate-700"}`}>
                        #{displaySeq}
                      </span>
                      <span>{menu.name}</span>
                      {isSelected && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingMenu(menu);
                          }}
                          className="text-slate-400 hover:text-red-400 p-0.5 ml-0.5 cursor-pointer"
                          title="Delete Menu"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* DISTINCT DRAFT TAB WHEN CREATING A NEW MENU */}
                {!editingMenu && (
                  <div
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#36D068] text-white shadow-xs flex items-center gap-1.5 shrink-0 border border-[#2ca752] animate-in fade-in duration-150"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md font-black bg-white/20 text-white">
                      New #{menuFormSequence || packageMenus.length + 1}
                    </span>
                    <span>{menuFormName || "New Menu"}</span>
                    <span className="text-[9px] uppercase font-extrabold bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded-full ml-0.5">
                      Drafting
                    </span>
                  </div>
                )}
              </div>

              {menuBuilderError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2 shrink-0">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{menuBuilderError}</span>
                </div>
              )}

              {/* IN-PLACE 5-DAY DRAG AND DROP BUILDER */}
              <form onSubmit={handleMenuBuilderSubmit} className="flex flex-col flex-1 min-h-0 space-y-3">

                {/* Menu Name & Sequence Input */}
                <div className={`shrink-0 p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                  !editingMenu
                    ? "bg-[#36D068]/5 border-[#36D068]/30 shadow-3xs"
                    : "bg-slate-50/80 border-slate-200/80"
                }`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-800 shrink-0">
                        Menu Name:
                      </label>
                      <input
                        type="text"
                        required
                        value={menuFormName}
                        onChange={(e) => setMenuFormName(e.target.value)}
                        placeholder="e.g. Standard Week 1"
                        className="w-44 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#36D068]"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <label className="text-xs font-bold text-slate-700 shrink-0">
                        Sequence #:
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={menuFormSequence}
                        onChange={(e) => setMenuFormSequence(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center text-slate-900 focus:outline-none focus:border-[#36D068]"
                        title="Sequence position number (1, 2, 3)"
                      />
                    </div>
                  </div>

                  {/* Mode Badge Indicator */}
                  {!editingMenu ? (
                    <span className="text-[11px] font-bold text-[#2ca752] bg-[#36D068]/15 px-2.5 py-1 rounded-full border border-[#36D068]/30 flex items-center gap-1.5 shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-[#36D068]" />
                      <span>Creating New Menu Schedule</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 flex items-center gap-1.5 shrink-0">
                      <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                      <span>Editing Saved Menu #{menuFormSequence}</span>
                    </span>
                  )}
                </div>

                {/* 5-DAY MON-FRI GRID BUILDER (SINGLE UNIFIED CARD CONTAINER) */}
                <div className={cn('flex-1', 'min-h-0', 'overflow-y-auto', 'pr-1')}>
                  <div className={cn('bg-slate-50/70', 'border', 'border-slate-200/80', 'rounded-2xl', 'p-3', 'shadow-2xs')}>
                    <div className={cn('grid', 'grid-cols-1', 'sm:grid-cols-5', 'gap-3')}>
                      {DAYS.map((d, idx) => {
                        const daySlots = menuSlots[d.key];
                        const isEmergencyShown = showEmergencySlots[d.key];

                        const renderSlotDropZone = (
                          slotType: SlotType,
                          title: string,
                          isMandatory: boolean,
                          colorClass: string
                        ) => {
                          const mealId = daySlots[slotType];
                          const assignedMeal = mealId ? mealsMap.get(mealId) : null;

                          return (
                            <div
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => handleDropMealOnSlot(d.key, slotType, e)}
                              className={`border-2 rounded-xl p-2 transition-all min-h-[60px] flex flex-col justify-between ${mealId
                                ? "bg-white border-solid border-[#36D068] shadow-3xs"
                                : `border-dashed ${colorClass} hover:border-[#36D068]`
                                }`}
                            >
                              <div className={cn('flex', 'items-center', 'justify-between', 'gap-1', 'mb-1')}>
                                <span className={cn('text-[9px]', 'font-bold', 'uppercase', 'tracking-wider', 'text-slate-600', 'flex', 'items-center', 'gap-1')}>
                                  <span>{title}</span>
                                  {isMandatory && <span className={cn('text-red-500', 'font-extrabold')}>*</span>}
                                </span>
                                {mealId && (
                                  <button
                                    type="button"
                                    onClick={() => handleClearSlot(d.key, slotType)}
                                    className={cn('text-slate-400', 'hover:text-red-600', 'p-0.5', 'cursor-pointer')}
                                    title="Clear slot"
                                  >
                                    <X className={cn('w-3', 'h-3')} />
                                  </button>
                                )}
                              </div>

                              {assignedMeal ? (
                                <div className={cn('flex', 'items-center', 'gap-1.5', 'bg-slate-50', 'p-1', 'rounded-lg', 'border', 'border-slate-200/60', 'min-w-0')}>
                                  <div className={cn('w-5', 'h-5', 'rounded-md', 'bg-slate-200', 'overflow-hidden', 'shrink-0', 'flex', 'items-center', 'justify-center', 'text-slate-400')}>
                                    {assignedMeal.image_url ? (
                                      /* eslint-disable-next-line @next/next/no-img-element */
                                      <img
                                        src={assignedMeal.image_url}
                                        alt={assignedMeal.name}
                                        className={cn('w-full', 'h-full', 'object-cover')}
                                      />
                                    ) : (
                                      <UtensilsCrossed className={cn('w-3', 'h-3')} />
                                    )}
                                  </div>
                                  <span className={cn('text-[10px]', 'font-bold', 'text-slate-900', 'truncate', 'leading-tight')}>
                                    {assignedMeal.name}
                                  </span>
                                </div>
                              ) : (
                                /* Empty Slot Drag & Drop Placeholder */
                                <div className={cn('py-1', 'px-1.5', 'bg-slate-50/60', 'border', 'border-dashed', 'border-slate-200/80', 'rounded-md', 'text-[9px]', 'text-slate-400', 'font-medium', 'text-center', 'flex', 'items-center', 'justify-center', 'select-none', 'group-hover:border-[#36D068]/40', 'transition-colors')}>
                                  <span>+ Drag meal here</span>
                                </div>
                              )}
                            </div>
                          );
                        };

                        return (
                          <div
                            key={d.key}
                            className={`flex flex-col space-y-2 ${idx < DAYS.length - 1 ? "sm:border-r sm:border-slate-200/70 sm:pr-3" : ""
                              }`}
                          >
                            {/* Day Column Header */}
                            <div className={cn('text-center', 'pb-1', 'border-b', 'border-slate-200/80')}>
                              <span className={cn('font-extrabold', 'text-xs', 'text-slate-900', 'uppercase', 'tracking-wider', 'block')}>
                                {d.label}
                              </span>
                            </div>

                            {/* 1. Main Meal (Mandatory) */}
                            {renderSlotDropZone("meal_id", "Main Meal", true, "border-emerald-200 bg-emerald-50/30")}

                            {/* 2. Optional Meal */}
                            {renderSlotDropZone("optional_meal_id", "Optional Meal", false, "border-blue-200 bg-blue-50/30")}

                            {/* Emergency Meal Toggle Button */}
                            <button
                              type="button"
                              onClick={() => toggleEmergencyForDay(d.key)}
                              className={cn('text-[9px]', 'font-bold', 'text-amber-600', 'hover:text-amber-700', 'bg-amber-50', 'hover:bg-amber-100', 'border', 'border-amber-200', 'py-1', 'px-1.5', 'rounded-lg', 'transition-colors', 'flex', 'items-center', 'justify-center', 'gap-1', 'cursor-pointer')}
                            >
                              <span>{isEmergencyShown ? "− Hide Emergency" : "+ Add Emergency"}</span>
                            </button>

                            {/* 3 & 4. Emergency Meals (Rendered on demand) */}
                            {isEmergencyShown && (
                              <div className={cn('space-y-2', 'pt-1', 'border-t', 'border-slate-200/60', 'animate-in', 'fade-in', 'duration-150')}>
                                {renderSlotDropZone("emergency_meal_change_id", "Emerg. Main", false, "border-amber-200 bg-amber-50/30")}
                                {renderSlotDropZone("emergency_optional_meal_change_id", "Emerg. Opt.", false, "border-purple-200 bg-purple-50/30")}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Workspace Footer Action Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 shrink-0">
                  <span className="text-[11px] text-slate-500 font-medium">
                    5 Main Meals required for Mon-Fri schedule.
                  </span>

                  <button
                    type="submit"
                    disabled={isSavingMenu}
                    className={`px-5 py-2 rounded-xl font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                      !editingMenu
                        ? "bg-[#36D068] hover:bg-[#2ca752] text-white shadow-[#36D068]/20"
                        : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20"
                    }`}
                  >
                    {isSavingMenu ? (
                      <>
                        <div className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                        <span>Saving Menu...</span>
                      </>
                    ) : !editingMenu ? (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Create & Save New Menu</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Update Saved Menu Schedule</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          ) : (
            /* ═════════════════════════════════════════════════════════════════ */
            /* ─── PACKAGES CATALOG GRID VIEW (CLICKABLE CARDS) ─── */
            /* ═════════════════════════════════════════════════════════════════ */
            <>
              {/* Compact Packages Header & Filter Bar */}
              <div className={cn('bg-white', 'border', 'border-slate-200/80', 'p-2.5', 'sm:p-3', 'rounded-2xl', 'shadow-xs', 'flex', 'flex-col', 'sm:flex-row', 'items-stretch', 'sm:items-center', 'justify-between', 'gap-3', 'shrink-0')}>
                <div className={cn('flex', 'items-center', 'gap-2.5')}>
                  <div className={cn('p-1.5', 'bg-[#36D068]/15', 'text-[#36D068]', 'rounded-xl')}>
                    <PackageIcon className={cn('w-4', 'h-4')} />
                  </div>
                  <div>
                    <h2 className={cn('text-sm', 'font-bold', 'text-slate-900', 'leading-none')}>Packages</h2>
                  </div>
                </div>

                <div className={cn('flex', 'items-center', 'gap-2')}>
                  {/* Search Packages Input */}
                  <div className={cn('relative', 'flex-1', 'sm:w-48')}>
                    <Search className={cn('w-3.5', 'h-3.5', 'absolute', 'left-3', 'top-1/2', '-translate-y-1/2', 'text-slate-400')} />
                    <input
                      type="text"
                      value={packageSearchTerm}
                      onChange={(e) => {
                        setPackageSearchTerm(e.target.value);
                        setPackagePage(1);
                      }}
                      placeholder="Search packages..."
                      className={cn('w-full', 'pl-8', 'pr-3', 'py-1.5', 'bg-slate-50', 'border', 'border-slate-200', 'rounded-xl', 'text-xs', 'font-medium', 'focus:outline-none', 'focus:border-[#36D068]', 'focus:bg-white', 'transition-all')}
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    value={packageStatusFilter}
                    onChange={(e) => {
                      setPackageStatusFilter(e.target.value as "all" | "active" | "inactive");
                      setPackagePage(1);
                    }}
                    className={cn('py-1.5', 'px-2.5', 'bg-slate-50', 'border', 'border-slate-200', 'rounded-xl', 'text-xs', 'font-medium', 'text-slate-700', 'focus:outline-none', 'focus:border-[#36D068]', 'transition-all', 'cursor-pointer')}
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>
              </div>

              {/* Package Error Alert */}
              {packageError && (
                <div className={cn('p-3', 'bg-red-50', 'border', 'border-red-200', 'rounded-xl', 'flex', 'items-center', 'gap-3', 'text-red-700', 'text-xs', 'shrink-0')}>
                  <AlertCircle className={cn('w-4', 'h-4', 'shrink-0')} />
                  <span>{packageError}</span>
                </div>
              )}

              {/* Package List Grid (Cards Clickable for Menus) */}
              <div className={cn('flex-1', 'min-h-0', 'overflow-y-auto', 'pr-1')}>
                {isLoadingPackages ? (
                  <div className={cn('bg-white', 'border', 'border-slate-200/80', 'rounded-2xl', 'p-10', 'text-center', 'text-slate-400', 'font-medium', 'text-xs', 'flex', 'flex-col', 'items-center', 'gap-2')}>
                    <div className={cn('animate-spin', 'w-5', 'h-5', 'border-2', 'border-[#36D068]', 'border-t-transparent', 'rounded-full')} />
                    <span>Loading packages catalog...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-3">
                    {packages.map((pkg) => {
                      const isActive = pkg.is_active ?? true;
                      const plansList = pkg.plans || pkg.assigned_plans || [];

                      return (
                        <div
                          key={pkg.id}
                          onClick={() => handleSelectPackageForMenus(pkg)}
                          className="bg-white border border-slate-200/80 hover:border-[#36D068] rounded-3xl p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer min-h-[220px]"
                        >
                          <div>
                            {/* Top Header & Status Badge */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-slate-100 text-slate-700 group-hover:bg-[#36D068]/15 group-hover:text-[#36D068] transition-colors shrink-0">
                                  <PackageIcon className="w-5 h-5" />
                                </div>
                                <div>
                                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-[#36D068] transition-colors leading-tight">
                                    {pkg.name}
                                  </h3>
                                  <span
                                    className={`inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${isActive
                                      ? "bg-[#36D068]/15 text-[#2ca752]"
                                      : "bg-slate-100 text-slate-500"
                                      }`}
                                  >
                                    {isActive ? "Active" : "Inactive"}
                                  </span>
                                </div>
                              </div>

                              {/* Package Actions */}
                              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={(e) => handleOpenManagePlans(pkg, e)}
                                  className="p-2 rounded-xl text-slate-500 hover:text-[#36D068] hover:bg-[#36D068]/10 transition-colors cursor-pointer"
                                  title="Manage Plans & Pricing"
                                >
                                  <Layers className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleOpenEditPackageModal(pkg, e)}
                                  className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                  title="Edit Package"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingPackage(pkg);
                                  }}
                                  className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Delete Package"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Package Description */}
                            <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">
                              {pkg.description || "No description provided."}
                            </p>
                          </div>

                          {/* Assigned Plans Summary Pills */}
                          <div className="pt-3.5 border-t border-slate-100">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                              <span>Assigned Plans</span>
                              <span className="text-[#36D068] font-bold group-hover:underline">
                                Click to view menus →
                              </span>
                            </div>

                            {plansList.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {plansList.map((planItem, idx) => {
                                  const name = planItem.plan_name || planItem.name || `Plan ${idx + 1}`;
                                  return (
                                    <span
                                      key={planItem.plan_id || idx}
                                      className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 px-3 py-1 rounded-xl text-xs font-semibold text-slate-800"
                                    >
                                      <Tag className="w-3.5 h-3.5 text-[#36D068]" />
                                      <span>{name}:</span>
                                      <span className="text-[#36D068] font-bold">
                                        LKR {planItem.price?.toLocaleString()}
                                      </span>
                                    </span>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic">No plans assigned yet.</p>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* ─── ADD PACKAGE CARD AT END OF LIST ─── */}
                    <div
                      onClick={handleOpenCreatePackageModal}
                      className="border-2 border-dashed border-slate-300 hover:border-[#36D068] bg-slate-50/50 hover:bg-[#36D068]/5 transition-all p-6 rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer group min-h-[220px]"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-400 group-hover:text-[#36D068] group-hover:border-[#36D068]/30 transition-all mb-3">
                        <Plus className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-[#36D068] transition-colors">
                        Add Package
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                        Create new package & configure plans
                      </p>
                    </div>

                  </div>
                )}
              </div>

              {/* Package Pagination Footer */}
              {pagination.total_pages > 1 && (
                <div className={cn('flex', 'items-center', 'justify-between', 'bg-white', 'border', 'border-slate-200/80', 'px-4', 'py-2', 'rounded-xl', 'text-xs', 'font-semibold', 'text-slate-600', 'shrink-0')}>
                  <span>
                    Page {packagePage} of {pagination.total_pages}
                  </span>
                  <div className={cn('flex', 'items-center', 'gap-1.5')}>
                    <button
                      type="button"
                      disabled={!pagination.has_prev}
                      onClick={() => setPackagePage((p) => Math.max(1, p - 1))}
                      className={cn('p-1', 'rounded-md', 'border', 'border-slate-200', 'hover:bg-slate-100', 'disabled:opacity-40', 'transition-colors', 'cursor-pointer')}
                    >
                      <ChevronLeft className={cn('w-3.5', 'h-3.5')} />
                    </button>
                    <button
                      type="button"
                      disabled={!pagination.has_next}
                      onClick={() => setPackagePage((p) => p + 1)}
                      className={cn('p-1', 'rounded-md', 'border', 'border-slate-200', 'hover:bg-slate-100', 'disabled:opacity-40', 'transition-colors', 'cursor-pointer')}
                    >
                      <ChevronRight className={cn('w-3.5', 'h-3.5')} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        </div>


        {/* ─── RIGHT COLUMN: MEALS SECTION SIDEBAR PANEL (ONLY SHOWN INSIDE MENU BUILDER FOR DRAGGING MEALS) ─── */}
        {selectedPackageForMenus && (
          <div className={cn('lg:col-span-5', 'xl:col-span-4', 'flex', 'flex-col', 'min-h-0', 'h-full')}>
            <div className={cn('bg-white', 'border', 'border-slate-200/80', 'rounded-2xl', 'p-3', 'shadow-xs', 'flex', 'flex-col', 'min-h-0', 'h-full', 'space-y-2')}>

              {/* Meals Top Header with Add Meal Button */}
              <div className={cn('flex', 'items-center', 'justify-between', 'pb-1.5', 'border-b', 'border-slate-100', 'shrink-0')}>
                <div className={cn('flex', 'items-center', 'gap-1.5')}>
                  <div className={cn('p-1', 'rounded-md', 'bg-[#36D068]/15', 'text-[#36D068]')}>
                    <UtensilsCrossed className={cn('w-3.5', 'h-3.5')} />
                  </div>
                  <h2 className={cn('text-xs', 'font-bold', 'text-slate-900', 'uppercase', 'tracking-wide', 'flex', 'items-center', 'gap-1')}>
                    <span>Meals</span>
                    <span className={cn('text-[10px]', 'font-bold', 'text-[#36D068]', 'bg-[#36D068]/10', 'px-1.5', 'py-0.2', 'rounded-full')}>
                      {meals.length}
                    </span>
                  </h2>
                </div>

                {/* Add Meal Button */}
                <button
                  type="button"
                  onClick={handleOpenCreateMealModal}
                  className={cn('bg-[#36D068]', 'hover:bg-[#2ca752]', 'text-white', 'px-2.5', 'py-1', 'rounded-md', 'font-semibold', 'text-[11px]', 'transition-all', 'shadow-2xs', 'flex', 'items-center', 'gap-1', 'cursor-pointer', 'shrink-0')}
                >
                  <Plus className={cn('w-3', 'h-3')} />
                  <span>Add Meal</span>
                </button>
              </div>

              {/* Micro Single-Row Filtering & Search Bar */}
              <div className={cn('flex', 'items-center', 'gap-1.5', 'bg-slate-50', 'p-1', 'rounded-lg', 'border', 'border-slate-200/60', 'shrink-0')}>
                {/* Filter Select Dropdown */}
                <div className={cn('relative', 'flex-1', 'min-w-0')}>
                  <select
                    value={mealFilterMode}
                    onChange={(e) => setMealFilterMode(e.target.value)}
                    className={cn('w-full', 'py-0.5', 'px-1.5', 'bg-white', 'border', 'border-slate-200', 'rounded-md', 'text-[10px]', 'font-medium', 'text-slate-800', 'focus:outline-none', 'focus:border-[#36D068]', 'transition-all', 'cursor-pointer', 'truncate')}
                  >
                    <option value="all">All Meals</option>
                    <option value="unassigned">Unassigned</option>
                    <optgroup label="By Package">
                      {packages.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Meal Search Input */}
                <div className={cn('relative', 'flex-1', 'min-w-0')}>
                  <Search className={cn('w-3', 'h-3', 'absolute', 'left-1.5', 'top-1/2', '-translate-y-1/2', 'text-slate-400')} />
                  <input
                    type="text"
                    value={mealSearchTerm}
                    onChange={(e) => setMealSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className={cn('w-full', 'pl-6', 'pr-1.5', 'py-0.5', 'bg-white', 'border', 'border-slate-200', 'rounded-md', 'text-[10px]', 'font-medium', 'text-slate-800', 'focus:outline-none', 'focus:border-[#36D068]', 'transition-all')}
                  />
                </div>
              </div>

              {/* Meals Error Alert */}
              {mealsError && (
                <div className={cn('p-2', 'bg-red-50', 'border', 'border-red-200', 'rounded-lg', 'text-red-700', 'text-[11px]', 'flex', 'items-center', 'gap-1.5', 'shrink-0')}>
                  <AlertCircle className={cn('w-3.5', 'h-3.5', 'shrink-0')} />
                  <span>{mealsError}</span>
                </div>
              )}

              {/* Meals Cards List (DRAGGABLE TO MENU BUILDER SLOTS) */}
              <div className={cn('flex-1', 'min-h-0', 'overflow-y-auto', 'space-y-1', 'pr-0.5')}>
                {isLoadingMeals ? (
                  <div className={cn('py-4', 'text-center', 'text-slate-400', 'text-xs', 'font-medium', 'flex', 'flex-col', 'items-center', 'gap-1')}>
                    <div className={cn('animate-spin', 'w-4', 'h-4', 'border-2', 'border-[#36D068]', 'border-t-transparent', 'rounded-full')} />
                    <span>Loading...</span>
                  </div>
                ) : meals.length === 0 ? (
                  <div className={cn('py-4', 'text-center', 'bg-slate-50/50', 'rounded-lg', 'border', 'border-dashed', 'border-slate-200', 'text-slate-400', 'text-xs', 'space-y-0.5')}>
                    <UtensilsCrossed className={cn('w-4', 'h-4', 'mx-auto', 'text-slate-300', 'mb-0.5')} />
                    <p className={cn('font-semibold', 'text-slate-600', 'text-[11px]')}>No meals found</p>
                    <p className="text-[10px]">No items match filter.</p>
                  </div>
                ) : (
                  meals.map((meal) => (
                    <div
                      key={meal.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", meal.id);
                        e.dataTransfer.setData("meal_id", meal.id);
                      }}
                      className={cn('bg-white', 'border', 'border-slate-200/80', 'hover:border-[#36D068]/60', 'rounded-lg', 'p-1.5', 'shadow-3xs', 'transition-all', 'flex', 'items-center', 'justify-between', 'gap-2', 'group', 'hover:bg-slate-50/80', 'cursor-grab', 'active:cursor-grabbing')}
                      title="Drag this meal onto a Menu Builder slot"
                    >
                      <div className={cn('flex', 'items-center', 'gap-2', 'min-w-0')}>
                        <GripVertical className={cn('w-3', 'h-3', 'text-slate-300', 'group-hover:text-[#36D068]', 'shrink-0')} />
                        <div className={cn('w-7', 'h-7', 'rounded-md', 'bg-slate-100', 'border', 'border-slate-200', 'overflow-hidden', 'shrink-0', 'flex', 'items-center', 'justify-center', 'text-slate-400')}>
                          {meal.image_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={meal.image_url}
                              alt={meal.name}
                              className={cn('w-full', 'h-full', 'object-cover')}
                            />
                          ) : (
                            <UtensilsCrossed className={cn('w-3.5', 'h-3.5')} />
                          )}
                        </div>

                        <div className={cn('min-w-0', 'leading-none')}>
                          <h4 className={cn('font-bold', 'text-[11px]', 'text-slate-900', 'truncate', 'group-hover:text-[#36D068]', 'transition-colors', 'leading-tight')}>
                            {meal.name}
                          </h4>
                          <p className={cn('text-[9px]', 'text-slate-500', 'truncate', 'leading-none', 'mt-0.5')}>
                            {meal.description || "No description"}
                          </p>
                        </div>
                      </div>

                      <div className={cn('flex', 'items-center', 'gap-0.5', 'shrink-0')} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditMealModal(meal)}
                          className={cn('p-0.5', 'text-slate-400', 'hover:text-blue-600', 'transition-colors', 'cursor-pointer')}
                          title="Edit Meal"
                        >
                          <Edit2 className={cn('w-3', 'h-3')} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingMeal(meal)}
                          className={cn('p-0.5', 'text-slate-400', 'hover:text-red-600', 'transition-colors', 'cursor-pointer')}
                          title="Delete Meal"
                        >
                          <Trash2 className={cn('w-3', 'h-3')} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className={cn('pt-1', 'border-t', 'border-slate-100', 'flex', 'items-center', 'justify-between', 'text-[9px]', 'text-slate-400', 'font-medium', 'shrink-0')}>
                <span>Drag meals onto Menu slots</span>
                <span className={cn('capitalize', 'text-[#36D068]', 'font-bold')}>
                  {mealFilterMode === "all" ? "All" : mealFilterMode}
                </span>
              </div>

            </div>
          </div>
        )}

      </div>


      {/* ─── MODAL: DELETE MENU CONFIRM ─── */}
      {deletingMenu && (
        <div className={cn('fixed', 'inset-0', 'z-50', 'bg-slate-900/40', 'backdrop-blur-xs', 'flex', 'items-center', 'justify-center', 'p-4')}>
          <div className={cn('bg-white', 'rounded-3xl', 'border', 'border-slate-200', 'shadow-2xl', 'max-w-sm', 'w-full', 'p-6', 'space-y-4', 'animate-in', 'fade-in', 'zoom-in-95', 'duration-150', 'text-center')}>
            <div className={cn('w-12', 'h-12', 'rounded-2xl', 'bg-red-50', 'text-red-600', 'border', 'border-red-200', 'flex', 'items-center', 'justify-center', 'mx-auto')}>
              <Trash2 className={cn('w-6', 'h-6')} />
            </div>
            <div>
              <h3 className={cn('text-lg', 'font-bold', 'text-slate-900')}>Delete Menu</h3>
              <p className={cn('text-xs', 'text-slate-500', 'mt-1')}>
                Are you sure you want to delete <strong>"{deletingMenu.name}"</strong>?
              </p>
            </div>
            <div className={cn('flex', 'items-center', 'gap-3', 'pt-2')}>
              <button
                type="button"
                onClick={() => setDeletingMenu(null)}
                className={cn('w-full', 'py-2.5', 'rounded-xl', 'border', 'border-slate-200', 'text-slate-700', 'font-semibold', 'text-xs', 'hover:bg-slate-100', 'transition-all', 'cursor-pointer')}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteMenuConfirm}
                disabled={isDeletingMenu}
                className={cn('w-full', 'py-2.5', 'rounded-xl', 'bg-red-600', 'hover:bg-red-700', 'text-white', 'font-semibold', 'text-xs', 'transition-all', 'shadow-md', 'shadow-red-600/20', 'flex', 'items-center', 'justify-center', 'gap-2', 'cursor-pointer', 'disabled:opacity-50')}
              >
                {isDeletingMenu ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ─── MODAL 1: ADD / EDIT PACKAGE ─── */}
      {isPackageModalOpen && (
        <div className={cn('fixed', 'inset-0', 'z-50', 'bg-slate-900/40', 'backdrop-blur-xs', 'flex', 'items-center', 'justify-center', 'p-4')}>
          <div className={cn('bg-white', 'rounded-3xl', 'border', 'border-slate-200', 'shadow-2xl', 'max-w-md', 'w-full', 'p-6', 'space-y-5', 'animate-in', 'fade-in', 'zoom-in-95', 'duration-150')}>
            <div className={cn('flex', 'items-center', 'justify-between', 'pb-3', 'border-b', 'border-slate-100')}>
              <div className={cn('flex', 'items-center', 'gap-2.5')}>
                <div className={cn('p-2', 'rounded-xl', 'bg-[#36D068]/15', 'text-[#36D068]')}>
                  <PackageIcon className={cn('w-5', 'h-5')} />
                </div>
                <h3 className={cn('text-lg', 'font-bold', 'text-slate-900')}>
                  {editingPackage ? "Edit Package" : "Create New Package"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPackageModalOpen(false)}
                className={cn('text-slate-400', 'hover:text-slate-600', 'p-1')}
              >
                <X className={cn('w-5', 'h-5')} />
              </button>
            </div>

            {packageModalError && (
              <div className={cn('p-3', 'bg-red-50', 'border', 'border-red-200', 'rounded-xl', 'text-red-700', 'text-xs', 'flex', 'items-center', 'gap-2')}>
                <AlertCircle className={cn('w-4', 'h-4', 'shrink-0')} />
                <span>{packageModalError}</span>
              </div>
            )}

            <form onSubmit={handlePackageFormSubmit} className="space-y-4">
              <div>
                <label className={cn('block', 'text-xs', 'font-bold', 'text-slate-700', 'mb-1')}>
                  Package Name *
                </label>
                <input
                  type="text"
                  required
                  value={formPackageName}
                  onChange={(e) => setFormPackageName(e.target.value)}
                  placeholder="e.g. Power Package, Classic Package"
                  className={cn('w-full', 'px-3.5', 'py-2.5', 'border', 'border-slate-200', 'rounded-xl', 'text-xs', 'font-medium', 'focus:outline-none', 'focus:border-[#36D068]')}
                />
              </div>

              <div>
                <label className={cn('block', 'text-xs', 'font-bold', 'text-slate-700', 'mb-1')}>
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formPackageDescription}
                  onChange={(e) => setFormPackageDescription(e.target.value)}
                  placeholder="Brief description of meal offerings in this package..."
                  className={cn('w-full', 'px-3.5', 'py-2.5', 'border', 'border-slate-200', 'rounded-xl', 'text-xs', 'font-medium', 'focus:outline-none', 'focus:border-[#36D068]')}
                />
              </div>

              {/* Active Toggle */}
              <div className={cn('flex', 'items-center', 'justify-between', 'p-3', 'bg-slate-50', 'border', 'border-slate-200/80', 'rounded-2xl')}>
                <div>
                  <span className={cn('block', 'text-xs', 'font-bold', 'text-slate-800')}>Package Status</span>
                  <span className={cn('text-[11px]', 'text-slate-500')}>Enable or disable availability</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormPackageIsActive(!formPackageIsActive)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${formPackageIsActive ? "bg-[#36D068]" : "bg-slate-300"
                    }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${formPackageIsActive ? "translate-x-5" : "translate-x-0"
                      }`}
                  />
                </button>
              </div>

              {/* Multi-Plan Assignment for New Package */}
              {!editingPackage && (
                <div className="p-4 bg-[#36D068]/5 border border-[#36D068]/20 rounded-2xl space-y-3">
                  <div>
                    <span className="block text-xs font-bold text-slate-900">
                      Assign Subscription Plans & Package Prices *
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Select one or more plans and enter the Package Price for each.
                    </span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {createModalPlans.map((plan) => {
                      const isSelected = selectedPlansMap[plan.id] !== undefined;
                      return (
                        <div
                          key={plan.id}
                          className={`p-3 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                            isSelected
                              ? "bg-white border-[#36D068] shadow-3xs"
                              : "bg-slate-50/70 border-slate-200/80 hover:bg-white"
                          }`}
                        >
                          <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleToggleCreatePlanSelection(plan.id, e.target.checked)}
                              className="w-4 h-4 rounded text-[#36D068] focus:ring-[#36D068] cursor-pointer"
                            />
                            <span className="text-xs font-bold text-slate-800">{plan.name}</span>
                          </label>

                          {isSelected && (
                            <div className="flex items-center gap-1.5 shrink-0 pl-6 sm:pl-0">
                              <span className="text-[11px] font-semibold text-slate-600">
                                Package Price (LKR):
                              </span>
                              <input
                                type="number"
                                min="1"
                                required
                                value={selectedPlansMap[plan.id]?.price}
                                onChange={(e) => handleCreatePlanPriceChange(plan.id, e.target.value)}
                                placeholder="e.g. 15000"
                                className="w-28 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-[#36D068]"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className={cn('flex', 'items-center', 'gap-3', 'pt-2')}>
                <button
                  type="button"
                  onClick={() => setIsPackageModalOpen(false)}
                  className={cn('w-full', 'py-2.5', 'rounded-xl', 'border', 'border-slate-200', 'text-slate-700', 'font-semibold', 'text-xs', 'hover:bg-slate-100', 'transition-all', 'cursor-pointer')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPackage}
                  className={cn('w-full', 'py-2.5', 'rounded-xl', 'bg-[#36D068]', 'hover:bg-[#2ca752]', 'text-white', 'font-semibold', 'text-xs', 'transition-all', 'shadow-md', 'shadow-[#36D068]/20', 'flex', 'items-center', 'justify-center', 'gap-2', 'cursor-pointer', 'disabled:opacity-50')}
                >
                  {isSavingPackage ? (
                    <>
                      <div className={cn('animate-spin', 'w-4', 'h-4', 'border-2', 'border-white', 'border-t-transparent', 'rounded-full')} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingPackage ? "Update Package" : "Create Package"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ─── MODAL 2: ASSIGN & MANAGE PLANS ─── */}
      {managingPackage && (
        <div className={cn('fixed', 'inset-0', 'z-50', 'bg-slate-900/40', 'backdrop-blur-xs', 'flex', 'items-center', 'justify-center', 'p-4')}>
          <div className={cn('bg-white', 'rounded-3xl', 'border', 'border-slate-200', 'shadow-2xl', 'max-w-lg', 'w-full', 'p-6', 'space-y-5', 'animate-in', 'fade-in', 'zoom-in-95', 'duration-150')}>
            <div className={cn('flex', 'items-center', 'justify-between', 'pb-3', 'border-b', 'border-slate-100')}>
              <div>
                <h3 className={cn('text-lg', 'font-bold', 'text-slate-900', 'leading-tight')}>
                  Manage Plans: {managingPackage.name}
                </h3>
                <p className={cn('text-xs', 'text-slate-500')}>Configure duration plans & pricing rates</p>
              </div>
              <button
                type="button"
                onClick={() => setManagingPackage(null)}
                className={cn('text-slate-400', 'hover:text-slate-600', 'p-1')}
              >
                <X className={cn('w-5', 'h-5')} />
              </button>
            </div>

            {plansModalError && (
              <div className={cn('p-3', 'bg-red-50', 'border', 'border-red-200', 'rounded-xl', 'text-red-700', 'text-xs', 'flex', 'items-center', 'gap-2')}>
                <AlertCircle className={cn('w-4', 'h-4', 'shrink-0')} />
                <span>{plansModalError}</span>
              </div>
            )}

            {isLoadingPlans ? (
              <div className={cn('py-8', 'text-center', 'text-slate-400', 'text-xs', 'font-medium')}>
                Loading assigned plans...
              </div>
            ) : (
              <div className="space-y-4">
                {/* Assigned Plans Table / Cards */}
                <div>
                  <h4 className={cn('text-xs', 'font-bold', 'text-slate-700', 'uppercase', 'tracking-wider', 'mb-2')}>
                    Currently Assigned Plans
                  </h4>

                  {assignedPlans.length === 0 ? (
                    <p className={cn('text-xs', 'text-slate-400', 'italic', 'bg-slate-50', 'p-3', 'rounded-xl')}>
                      No subscription plans assigned yet.
                    </p>
                  ) : (
                    <div className={cn('space-y-2', 'max-h-48', 'overflow-y-auto', 'pr-1')}>
                      {assignedPlans.map((plan) => {
                        const isEditingThis = editingPlanPriceId === plan.plan_id;
                        return (
                          <div
                            key={plan.plan_id}
                            className={cn('flex', 'items-center', 'justify-between', 'bg-slate-50', 'border', 'border-slate-200/80', 'p-3', 'rounded-2xl', 'text-xs', 'font-medium')}
                          >
                            <div>
                              <span className={cn('font-bold', 'text-slate-900', 'block')}>
                                {plan.plan_name || plan.name}
                              </span>
                              <span className={cn('text-[11px]', 'text-[#36D068]', 'font-bold')}>
                                LKR {plan.price?.toLocaleString()}
                              </span>
                            </div>

                            {isEditingThis ? (
                              <div className={cn('flex', 'items-center', 'gap-2')}>
                                <input
                                  type="number"
                                  value={editPriceVal}
                                  onChange={(e) =>
                                    setEditPriceVal(e.target.value ? Number(e.target.value) : "")
                                  }
                                  className={cn('w-24', 'px-2', 'py-1', 'bg-white', 'border', 'border-slate-300', 'rounded-lg', 'text-xs', 'font-bold')}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSavePrice(plan.plan_id)}
                                  disabled={isUpdatingPrice}
                                  className={cn('px-2.5', 'py-1', 'bg-[#36D068]', 'text-white', 'rounded-lg', 'font-semibold', 'cursor-pointer')}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingPlanPriceId(null)}
                                  className={cn('p-1', 'text-slate-400', 'hover:text-slate-600')}
                                >
                                  <X className={cn('w-4', 'h-4')} />
                                </button>
                              </div>
                            ) : (
                              <div className={cn('flex', 'items-center', 'gap-1')}>
                                <button
                                  type="button"
                                  onClick={() => handleStartEditPrice(plan)}
                                  className={cn('p-1.5', 'text-slate-400', 'hover:text-blue-600', 'transition-colors', 'cursor-pointer')}
                                  title="Edit Price"
                                >
                                  <Edit2 className={cn('w-3.5', 'h-3.5')} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUnassignPlan(plan.plan_id)}
                                  className={cn('p-1.5', 'text-slate-400', 'hover:text-red-600', 'transition-colors', 'cursor-pointer')}
                                  title="Unassign Plan"
                                >
                                  <Trash2 className={cn('w-3.5', 'h-3.5')} />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Assign New Plan Form */}
                <form
                  onSubmit={handleAssignPlanSubmit}
                  className={cn('pt-3', 'border-t', 'border-slate-100', 'space-y-3')}
                >
                  <h4 className={cn('text-xs', 'font-bold', 'text-slate-700', 'uppercase', 'tracking-wider')}>
                    Assign New Plan
                  </h4>

                  <div className={cn('grid', 'grid-cols-1', 'sm:grid-cols-2', 'gap-3')}>
                    <div>
                      <label className={cn('block', 'text-[11px]', 'font-semibold', 'text-slate-600', 'mb-1')}>
                        Select Available Plan
                      </label>
                      <select
                        value={selectedPlanId}
                        onChange={(e) => setSelectedPlanId(e.target.value)}
                        className={cn('w-full', 'px-3', 'py-2', 'bg-slate-50', 'border', 'border-slate-200', 'rounded-xl', 'text-xs', 'font-medium', 'focus:outline-none', 'focus:border-[#36D068]')}
                      >
                        <option value="">Select a plan...</option>
                        {unassignedSubscriptionPlans.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Package Price (LKR)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={newPlanPrice}
                        onChange={(e) =>
                          setNewPlanPrice(e.target.value ? Number(e.target.value) : "")
                        }
                        placeholder="e.g. 18000"
                        className={cn('w-full', 'px-3', 'py-2', 'bg-slate-50', 'border', 'border-slate-200', 'rounded-xl', 'text-xs', 'font-medium', 'focus:outline-none', 'focus:border-[#36D068]')}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAssigningPlan || !selectedPlanId || !newPlanPrice}
                    className={cn('w-full', 'py-2', 'bg-[#36D068]', 'hover:bg-[#2ca752]', 'text-white', 'font-semibold', 'text-xs', 'rounded-xl', 'transition-all', 'shadow-xs', 'flex', 'items-center', 'justify-center', 'gap-1.5', 'cursor-pointer', 'disabled:opacity-50')}
                  >
                    <Plus className={cn('w-4', 'h-4')} />
                    <span>Assign Plan to Package</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}


      {/* ─── MODAL 3: DELETE PACKAGE CONFIRM ─── */}
      {deletingPackage && (
        <div className={cn('fixed', 'inset-0', 'z-50', 'bg-slate-900/40', 'backdrop-blur-xs', 'flex', 'items-center', 'justify-center', 'p-4')}>
          <div className={cn('bg-white', 'rounded-3xl', 'border', 'border-slate-200', 'shadow-2xl', 'max-w-sm', 'w-full', 'p-6', 'space-y-4', 'animate-in', 'fade-in', 'zoom-in-95', 'duration-150', 'text-center')}>
            <div className={cn('w-12', 'h-12', 'rounded-2xl', 'bg-red-50', 'text-red-600', 'border', 'border-red-200', 'flex', 'items-center', 'justify-center', 'mx-auto')}>
              <Trash2 className={cn('w-6', 'h-6')} />
            </div>
            <div>
              <h3 className={cn('text-lg', 'font-bold', 'text-slate-900')}>Delete Package</h3>
              <p className={cn('text-xs', 'text-slate-500', 'mt-1')}>
                Are you sure you want to delete <strong>"{deletingPackage.name}"</strong>?
              </p>
            </div>
            <div className={cn('flex', 'items-center', 'gap-3', 'pt-2')}>
              <button
                type="button"
                onClick={() => setDeletingPackage(null)}
                className={cn('w-full', 'py-2.5', 'rounded-xl', 'border', 'border-slate-200', 'text-slate-700', 'font-semibold', 'text-xs', 'hover:bg-slate-100', 'transition-all', 'cursor-pointer')}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePackageConfirm}
                disabled={isDeletingPackage}
                className={cn('w-full', 'py-2.5', 'rounded-xl', 'bg-red-600', 'hover:bg-red-700', 'text-white', 'font-semibold', 'text-xs', 'transition-all', 'shadow-md', 'shadow-red-600/20', 'flex', 'items-center', 'justify-center', 'gap-2', 'cursor-pointer', 'disabled:opacity-50')}
              >
                {isDeletingPackage ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ─── MODAL 4: ADD / EDIT MEAL ─── */}
      {isMealModalOpen && (
        <div className={cn('fixed', 'inset-0', 'z-50', 'bg-slate-900/40', 'backdrop-blur-xs', 'flex', 'items-center', 'justify-center', 'p-4')}>
          <div className={cn('bg-white', 'rounded-3xl', 'border', 'border-slate-200', 'shadow-2xl', 'max-w-md', 'w-full', 'p-6', 'space-y-5', 'animate-in', 'fade-in', 'zoom-in-95', 'duration-150')}>
            <div className={cn('flex', 'items-center', 'justify-between', 'pb-3', 'border-b', 'border-slate-100')}>
              <div className={cn('flex', 'items-center', 'gap-2.5')}>
                <div className={cn('p-2', 'rounded-xl', 'bg-[#36D068]/15', 'text-[#36D068]')}>
                  <UtensilsCrossed className={cn('w-5', 'h-5')} />
                </div>
                <h3 className={cn('text-lg', 'font-bold', 'text-slate-900')}>
                  {editingMeal ? "Edit Meal Item" : "Add New Meal Item"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMealModalOpen(false)}
                className={cn('text-slate-400', 'hover:text-slate-600', 'p-1')}
              >
                <X className={cn('w-5', 'h-5')} />
              </button>
            </div>

            {mealModalError && (
              <div className={cn('p-3', 'bg-red-50', 'border', 'border-red-200', 'rounded-xl', 'text-red-700', 'text-xs', 'flex', 'items-center', 'gap-2')}>
                <AlertCircle className={cn('w-4', 'h-4', 'shrink-0')} />
                <span>{mealModalError}</span>
              </div>
            )}

            <form onSubmit={handleMealFormSubmit} className="space-y-4">
              <div>
                <label className={cn('block', 'text-xs', 'font-bold', 'text-slate-700', 'mb-1')}>
                  Meal Name *
                </label>
                <input
                  type="text"
                  required
                  value={mealFormName}
                  onChange={(e) => setMealFormName(e.target.value)}
                  placeholder="e.g. Grilled Salmon Bowl, Chicken Quinoa Salad"
                  className={cn('w-full', 'px-3.5', 'py-2.5', 'border', 'border-slate-200', 'rounded-xl', 'text-xs', 'font-medium', 'focus:outline-none', 'focus:border-[#36D068]')}
                />
              </div>

              <div>
                <label className={cn('block', 'text-xs', 'font-bold', 'text-slate-700', 'mb-1')}>
                  Description
                </label>
                <textarea
                  rows={3}
                  value={mealFormDescription}
                  onChange={(e) => setMealFormDescription(e.target.value)}
                  placeholder="Describe ingredients, calories, macros, or dietary details..."
                  className={cn('w-full', 'px-3.5', 'py-2.5', 'border', 'border-slate-200', 'rounded-xl', 'text-xs', 'font-medium', 'focus:outline-none', 'focus:border-[#36D068]')}
                />
              </div>

              {/* Meal Image Upload */}
              <div>
                <label className={cn('block', 'text-xs', 'font-bold', 'text-slate-700', 'mb-1')}>
                  Meal Image
                </label>
                <div className="space-y-2">
                  <label className={cn('border-2', 'border-dashed', 'border-slate-200', 'hover:border-[#36D068]', 'bg-slate-50/50', 'rounded-2xl', 'p-4', 'flex', 'flex-col', 'items-center', 'justify-center', 'cursor-pointer', 'transition-all')}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMealFileChange}
                      className="hidden"
                    />
                    <Upload className={cn('w-6', 'h-6', 'text-slate-400', 'mb-1')} />
                    <span className={cn('text-xs', 'font-semibold', 'text-slate-700')}>
                      Upload Image File
                    </span>
                    <span className={cn('text-[10px]', 'text-slate-400')}>PNG, JPG up to 5MB</span>
                  </label>

                  {isUploadingMealImage && (
                    <div className={cn('p-2', 'bg-blue-50', 'text-blue-600', 'rounded-xl', 'text-xs', 'font-medium', 'flex', 'items-center', 'gap-2')}>
                      <div className={cn('animate-spin', 'w-4', 'h-4', 'border-2', 'border-blue-600', 'border-t-transparent', 'rounded-full')} />
                      <span>Compressing & uploading image...</span>
                    </div>
                  )}

                  {mealUploadSuccess && (
                    <div className={cn('p-2', 'bg-emerald-50', 'text-emerald-700', 'rounded-xl', 'text-xs', 'font-semibold', 'flex', 'items-center', 'gap-1.5')}>
                      <CheckCircle2 className={cn('w-4', 'h-4')} />
                      <span>Image uploaded successfully!</span>
                    </div>
                  )}

                  {mealImagePreview && (
                    <div className={cn('relative', 'w-full', 'h-32', 'rounded-2xl', 'overflow-hidden', 'border', 'border-slate-200', 'bg-slate-100')}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mealImagePreview}
                        alt="Preview"
                        className={cn('w-full', 'h-full', 'object-cover')}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className={cn('flex', 'items-center', 'gap-3', 'pt-2')}>
                <button
                  type="button"
                  onClick={() => setIsMealModalOpen(false)}
                  className={cn('w-full', 'py-2.5', 'rounded-xl', 'border', 'border-slate-200', 'text-slate-700', 'font-semibold', 'text-xs', 'hover:bg-slate-100', 'transition-all', 'cursor-pointer')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingMeal || isUploadingMealImage}
                  className={cn('w-full', 'py-2.5', 'rounded-xl', 'bg-[#36D068]', 'hover:bg-[#2ca752]', 'text-white', 'font-semibold', 'text-xs', 'transition-all', 'shadow-md', 'shadow-[#36D068]/20', 'flex', 'items-center', 'justify-center', 'gap-2', 'cursor-pointer', 'disabled:opacity-50')}
                >
                  {isSavingMeal ? "Saving..." : editingMeal ? "Update Meal" : "Add Meal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ─── MODAL 5: DELETE MEAL CONFIRM ─── */}
      {deletingMeal && (
        <div className={cn('fixed', 'inset-0', 'z-50', 'bg-slate-900/40', 'backdrop-blur-xs', 'flex', 'items-center', 'justify-center', 'p-4')}>
          <div className={cn('bg-white', 'rounded-3xl', 'border', 'border-slate-200', 'shadow-2xl', 'max-w-sm', 'w-full', 'p-6', 'space-y-4', 'animate-in', 'fade-in', 'zoom-in-95', 'duration-150', 'text-center')}>
            <div className={cn('w-12', 'h-12', 'rounded-2xl', 'bg-red-50', 'text-red-600', 'border', 'border-red-200', 'flex', 'items-center', 'justify-center', 'mx-auto')}>
              <Trash2 className={cn('w-6', 'h-6')} />
            </div>
            <div>
              <h3 className={cn('text-lg', 'font-bold', 'text-slate-900')}>Delete Meal</h3>
              <p className={cn('text-xs', 'text-slate-500', 'mt-1')}>
                Are you sure you want to delete <strong>"{deletingMeal.name}"</strong>?
              </p>
            </div>
            <div className={cn('flex', 'items-center', 'gap-3', 'pt-2')}>
              <button
                type="button"
                onClick={() => setDeletingMeal(null)}
                className={cn('w-full', 'py-2.5', 'rounded-xl', 'border', 'border-slate-200', 'text-slate-700', 'font-semibold', 'text-xs', 'hover:bg-slate-100', 'transition-all', 'cursor-pointer')}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteMealConfirm}
                disabled={isDeletingMeal}
                className={cn('w-full', 'py-2.5', 'rounded-xl', 'bg-red-600', 'hover:bg-red-700', 'text-white', 'font-semibold', 'text-xs', 'transition-all', 'shadow-md', 'shadow-red-600/20', 'flex', 'items-center', 'justify-center', 'gap-2', 'cursor-pointer', 'disabled:opacity-50')}
              >
                {isDeletingMeal ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
