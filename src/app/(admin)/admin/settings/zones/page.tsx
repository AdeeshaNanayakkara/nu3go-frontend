"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { zoneService, type ZoneItem } from "@/services/api/zone.service";
import {
  MapPin,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  ArrowLeft,
  Calendar,
  Globe,
} from "lucide-react";

export default function AdminZonesPage() {
  const [zones, setZones] = useState<ZoneItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ZoneItem | null>(null);
  const [formName, setFormName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete Confirmation Modal state
  const [deletingZone, setDeletingZone] = useState<ZoneItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Zones from API
  const fetchZones = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await zoneService.getZones();
      setZones(data);
    } catch (err: unknown) {
      console.error("[AdminZonesPage] Error fetching zones:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load zones from server."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  // Filtered Zones
  const filteredZones = useMemo(() => {
    return zones.filter((zone) => {
      return (
        !searchTerm ||
        zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zone.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [zones, searchTerm]);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingZone(null);
    setFormName("");
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (zone: ZoneItem) => {
    setEditingZone(zone);
    setFormName(zone.name);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Handle Create / Update Submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setModalError("Zone name is required.");
      return;
    }

    setIsSaving(true);
    setModalError(null);

    try {
      if (editingZone) {
        // Update existing Zone
        await zoneService.updateZone(editingZone.id, {
          name: formName.trim(),
        });
      } else {
        // Create new Zone
        await zoneService.createZone({
          name: formName.trim(),
        });
      }

      setIsModalOpen(false);
      fetchZones();
    } catch (err: unknown) {
      console.error("[AdminZonesPage] Save error:", err);
      setModalError(
        err instanceof Error ? err.message : "Failed to save zone. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete execution
  const handleDeleteConfirm = async () => {
    if (!deletingZone) return;
    setIsDeleting(true);
    try {
      await zoneService.deleteZone(deletingZone.id);
      setDeletingZone(null);
      fetchZones();
    } catch (err: unknown) {
      console.error("[AdminZonesPage] Delete error:", err);
      alert(err instanceof Error ? err.message : "Failed to delete zone.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 font-poppins text-slate-900">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link
          href="/admin/settings"
          className="flex items-center gap-1 hover:text-[#36D068] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Settings
        </Link>
        <span>/</span>
        <span className="text-slate-900">Zone Management</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#36D068]/15 text-[#36D068] text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Zone Portal
            </span>
            <span className="text-slate-500 text-xs font-medium">
              {zones.length} Total Zones
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Zone Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Configure service regions, delivery coverage zones, and availability areas.
          </p>
        </div>

        {/* Top-Right Action Button: Add New Zone */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 rounded-xl bg-[#36D068] hover:bg-[#2fc25e] text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-md shadow-[#36D068]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Zone</span>
          </button>
        </div>
      </div>

      {/* Search & Refresh Bar */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search zones by name or ID..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:bg-white focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all"
          />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={fetchZones}
            disabled={isLoading}
            className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all flex items-center gap-2 border border-slate-200 shadow-sm disabled:opacity-50 cursor-pointer"
            title="Refresh Zones"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 shadow-sm text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#36D068] border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">Loading available zones from server...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-3 shadow-sm">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h3 className="text-lg font-bold text-red-700">Failed to Load Zones</h3>
          <p className="text-sm text-red-600 max-w-md mx-auto">{error}</p>
          <button
            type="button"
            onClick={fetchZones}
            className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-all"
          >
            Try Again
          </button>
        </div>
      ) : filteredZones.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-sm">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Zones Found</h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            {searchTerm
              ? "No zones match your search query."
              : "No service zones have been configured yet. Click 'Add New Zone' to create one."}
          </p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 rounded-xl bg-[#36D068] hover:bg-[#2fc25e] text-white font-semibold text-sm transition-all inline-flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Zone</span>
          </button>
        </div>
      ) : (
        /* Zones List Table View */
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">
              Service Delivery Regions ({filteredZones.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4 rounded-l-xl">Region / Zone Name</th>
                  <th className="py-3.5 px-4">Zone ID</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredZones.map((zone) => {
                  const formattedDate = zone.created_at
                    ? new Date(zone.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A";

                  return (
                    <tr key={zone.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Zone Name */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900 capitalize flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[#36D068]/15 text-[#2ca752] shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span>{zone.name}</span>
                      </td>

                      {/* Zone ID */}
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                        {zone.id}
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {formattedDate}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          Active Region
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(zone)}
                            className="p-2 rounded-lg text-slate-500 hover:text-[#36D068] hover:bg-slate-100 transition-all"
                            title="Edit Zone"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingZone(zone)}
                            className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
                            title="Delete Zone"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── ADD / EDIT ZONE MODAL ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#36D068]/15 text-[#36D068]">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingZone ? "Edit Zone" : "Add New Zone"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingZone ? "Update zone region details" : "Configure a new service delivery region"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error banner in modal */}
            {modalError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Zone Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Zone Region Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Colombo, Kandy, Galle..."
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:bg-white focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#36D068] hover:bg-[#2fc25e] text-white font-semibold text-sm transition-all shadow-md shadow-[#36D068]/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingZone ? "Update Zone" : "Create Zone"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DELETE CONFIRMATION MODAL ─── */}
      {deletingZone && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Delete Zone?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete this region zone? This action cannot be undone.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-800 text-left">
              <span className="text-slate-900 font-bold block capitalize text-sm">{deletingZone.name}</span>
              <span className="text-slate-400 font-mono text-[10px]">ID: {deletingZone.id}</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingZone(null)}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Zone</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
