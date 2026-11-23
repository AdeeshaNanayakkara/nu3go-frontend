import * as XLSX from "xlsx";
import {
  type DeliveryListItem,
  formatDeliveryType,
  getCustomerPhone,
} from "@/services/api/delivery.service";
import { toast } from "@/lib/toast";

export function getCustomerName(item: DeliveryListItem): string {
  if (item.customer_name?.trim()) return item.customer_name.trim();
  if (item.name?.trim()) return item.name.trim();
  const fullName = `${item.first_name || ""} ${item.last_name || ""}`.trim();
  if (fullName) return fullName;
  if (item.customer_email) {
    const username = item.customer_email.split("@")[0] || "";
    const formatted = username
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    return formatted || username;
  }
  return "N/A";
}

/**
 * Exports the given deliveries list to a styled Excel (.xlsx) file
 */
export function exportDeliveriesToExcel(
  deliveries: DeliveryListItem[],
  deliveryDate: string
) {
  if (typeof window === "undefined") return;

  if (!deliveries || deliveries.length === 0) {
    toast.error("No deliveries to export for this date.");
    return;
  }

  try {
    const rows = deliveries.map((item, idx) => ({
      "#": idx + 1,
      "Customer Name": getCustomerName(item),
      "Customer Email": item.customer_email || "",
      "Phone Number": getCustomerPhone(item) === "—" ? "" : getCustomerPhone(item),
      "Delivery Address": item.location_address || "",
      "Delivery Type":
        formatDeliveryType(item.delivery_type) === "—"
          ? ""
          : formatDeliveryType(item.delivery_type),
      "Delivery Note": item.delivery_note?.trim() || "",
      "Plan Type": item.plan_type || "FIXED",
      "Delivery Status": item.delivered ? "Delivered" : "Pending",
      "Delivered At": item.delivered_at
        ? new Date(item.delivered_at).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
      "Subscription ID": item.subscription_id || "",
      "Location ID": item.location_id || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Auto column widths
    worksheet["!cols"] = [
      { wch: 6 },  // #
      { wch: 22 }, // Customer Name
      { wch: 28 }, // Customer Email
      { wch: 18 }, // Phone Number
      { wch: 38 }, // Delivery Address
      { wch: 24 }, // Delivery Type
      { wch: 32 }, // Delivery Note
      { wch: 12 }, // Plan Type
      { wch: 16 }, // Delivery Status
      { wch: 15 }, // Delivered At
      { wch: 26 }, // Subscription ID
      { wch: 18 }, // Location ID
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Deliveries ${deliveryDate}`);

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `Nu3Go-Deliveries-${deliveryDate}.xlsx`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${deliveries.length} deliveries to Excel!`);
  } catch (err) {
    console.error("[exportDeliveriesToExcel] Error exporting to Excel:", err);
    toast.error("Failed to generate Excel file. Please try again.");
  }
}
