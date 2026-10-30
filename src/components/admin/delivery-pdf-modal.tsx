"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  Printer,
  X,
  FileText,
  Calendar,
  Filter,
} from "lucide-react";
import { type DeliveryListItem } from "@/services/api/delivery.service";

interface DeliveryPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryDate: string; // YYYY-MM-DD
  deliveries: DeliveryListItem[];
  statusFilter: "ALL" | "DELIVERED" | "PENDING";
  planFilter: string;
  searchQuery: string;
  stats?: {
    total: number;
    deliveredCount: number;
    pendingCount: number;
    completionPct: number;
  };
}

function getCustomerName(item: DeliveryListItem): string {
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

function getCustomerMobile(item: DeliveryListItem): string {
  const phone =
    item.customer_phone ||
    item.mobile ||
    item.phone ||
    item.mobile_number ||
    item.contact_number;
  if (phone && phone.trim()) return phone.trim();
  return "-";
}

function formatDateFull(ymd: string): string {
  try {
    const parts = ymd.split("-");
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return ymd;
  } catch {
    return ymd;
  }
}


export function DeliveryPdfModal({
  isOpen,
  onClose,
  deliveryDate,
  deliveries,
  statusFilter,
  planFilter,
  searchQuery,
}: DeliveryPdfModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const formattedDate = formatDateFull(deliveryDate);
  const generatedTimestamp = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePrintToPdf = () => {
    setIsPrinting(true);

    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Nu3Go Deliveries Manifest - ${deliveryDate}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 10mm 12mm 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 11px;
      line-height: 1.4;
    }
    .header-table {
      width: 100%;
      border-bottom: 2px solid #36D068;
      padding-bottom: 12px;
      margin-bottom: 14px;
    }
    .logo-img {
      height: 48px;
      width: auto;
    }
    .doc-title {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
      margin: 0;
      text-transform: uppercase;
    }
    .doc-subtitle {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .meta-box {
      text-align: right;
      font-size: 10px;
      color: #475569;
    }
    .meta-box strong {
      color: #0f172a;
    }
    .filter-banner {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 12px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .filter-item {
      display: inline-block;
      margin-right: 14px;
      font-size: 10.5px;
    }
    .filter-label {
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      font-size: 9.5px;
    }
    .filter-val {
      font-weight: 600;
      color: #0f172a;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    table.data-table th {
      background-color: #f1f5f9;
      color: #334155;
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 8px 10px;
      border: 1px solid #cbd5e1;
      text-align: left;
    }
    table.data-table td {
      padding: 8px 10px;
      border: 1px solid #e2e8f0;
      font-size: 10.5px;
      vertical-align: top;
    }
    table.data-table tr:nth-child(even) {
      background-color: #f8fafc;
    }
    .footer-note {
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
      font-size: 9px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td style="width: 140px; vertical-align: middle;">
        <img src="${window.location.origin}/images/nu3go_logo.png" alt="Nu3Go Logo" class="logo-img" />
      </td>
      <td style="vertical-align: middle; padding-left: 14px;">
        <h1 class="doc-title">Daily Deliveries Manifest</h1>
        <div class="doc-subtitle">Nu3Go Healthy Meals Subscription Fulfillment Dispatch Report</div>
      </td>
      <td class="meta-box" style="vertical-align: middle;">
        <div><strong>Date:</strong> ${formattedDate}</div>
        <div><strong>Manifest Ref:</strong> MNF-${deliveryDate.replace(/-/g, "")}</div>
        <div><strong>Generated:</strong> ${generatedTimestamp}</div>
        <div><strong>Generated By:</strong> Nu3Go Operations Admin</div>
      </td>
    </tr>
  </table>

  <div class="filter-banner">
    <div>
      <span class="filter-item">
        <span class="filter-label">Delivery Date:</span>
        <span class="filter-val">${deliveryDate} (${formattedDate.split(",")[0]})</span>
      </span>
      <span class="filter-item">
        <span class="filter-label">Status Filter:</span>
        <span class="filter-val">${statusFilter}</span>
      </span>
      <span class="filter-item">
        <span class="filter-label">Plan Filter:</span>
        <span class="filter-val">${planFilter}</span>
      </span>
      ${
        searchQuery.trim()
          ? `<span class="filter-item"><span class="filter-label">Search Query:</span> <span class="filter-val">"${searchQuery.trim()}"</span></span>`
          : ""
      }
    </div>
    <div style="font-weight: 700; color: #334155;">
      Total Records: ${deliveries.length}
    </div>
  </div>

  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 32px; text-align: center;">#</th>
        <th style="width: 220px;">Customer</th>
        <th style="width: 130px;">Mobile Number</th>
        <th>Delivery Address</th>
      </tr>
    </thead>
    <tbody>
      ${
        deliveries.length === 0
          ? `<tr><td colspan="4" style="text-align: center; padding: 24px; color: #64748b;">No delivery records match the selected date and filters.</td></tr>`
          : deliveries
              .map((item, idx) => {
                const name = getCustomerName(item);
                const mobile = getCustomerMobile(item);
                return `
        <tr>
          <td style="text-align: center; font-weight: 700; color: #64748b;">${idx + 1}</td>
          <td>
            <div style="font-weight: 700; color: #0f172a; font-size: 11px;">${name}</div>
            <div style="font-size: 9px; color: #64748b; margin-top: 2px;">${item.customer_email || "N/A"}</div>
            ${
              item.subscription_id
                ? `<div style="font-size: 8px; color: #94a3b8; font-family: monospace; margin-top: 1px;">Sub ID: ${item.subscription_id.slice(
                    0,
                    12
                  )}...</div>`
                : ""
            }
          </td>
          <td style="font-weight: 600; color: #0f172a; font-size: 10.5px;">
            ${mobile}
          </td>
          <td>
            <div style="color: #1e293b; font-size: 10.5px; line-height: 1.35;">${
              item.location_address || "No delivery address provided"
            }</div>
            ${
              item.location_id
                ? `<div style="font-size: 8.5px; color: #94a3b8; margin-top: 2px;">Loc ID: ${item.location_id.slice(
                    0,
                    8
                  )}...</div>`
                : ""
            }
          </td>
        </tr>
      `;
              })
              .join("")
      }
    </tbody>
  </table>

  <div class="footer-note">
    <div>Nu3Go Healthy Meal Subscriptions • Confidential Daily Operations & Delivery Logistics Report</div>
    <div>Page 1 of 1 • System Generated by Nu3Go Admin Portal</div>
  </div>
</body>
</html>
`;

    // Create a hidden iframe for clean printing without UI disruption
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(printContent);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
          setIsPrinting(false);
        }, 1000);
      }, 500);
    } else {
      setIsPrinting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* ─── Top Modal Action Header ─── */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#36D068]/15 text-[#36D068]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Deliveries Manifest — PDF Export Preview
              </h2>
              <p className="text-xs text-slate-500">
                Print or save as PDF for date: <strong>{deliveryDate}</strong> ({deliveries.length}{" "}
                orders included)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintToPdf}
              disabled={isPrinting}
              className="px-4 py-2 bg-[#36D068] hover:bg-[#2fb85b] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>{isPrinting ? "Opening Print..." : "Print / Save as PDF"}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-800 rounded-xl bg-slate-200/60 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ─── Document Visual Preview Container (Paper Layout) ─── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center">
          <div
            ref={printAreaRef}
            className="bg-white border border-slate-300 rounded-2xl w-full max-w-4xl p-6 sm:p-8 shadow-sm text-slate-800 space-y-5 my-auto"
            style={{ minHeight: "680px" }}
          >
            {/* Header: Logo + Title + Metadata */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#36D068]">
              <div className="flex items-center gap-4">
                <div className="relative w-28 h-12">
                  <Image
                    src="/images/nu3go_logo.png"
                    alt="Nu3Go"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                    Daily Deliveries Manifest
                  </h1>
                  <p className="text-xs text-slate-500">
                    Nu3Go Healthy Meals Subscription Fulfillment Dispatch Report
                  </p>
                </div>
              </div>

              <div className="text-right text-xs text-slate-500 space-y-0.5 sm:self-center">
                <p>
                  Date: <strong className="text-slate-900">{formattedDate}</strong>
                </p>
                <p>
                  Ref ID:{" "}
                  <strong className="font-mono text-slate-800">
                    MNF-{deliveryDate.replace(/-/g, "")}
                  </strong>
                </p>
                <p>
                  Generated: <span className="text-slate-600">{generatedTimestamp}</span>
                </p>
              </div>
            </div>

            {/* Filter Scope & Criteria Banner */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-[#36D068]" />
                  <span>
                    <strong>Date:</strong> {deliveryDate}
                  </span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    <strong>Status:</strong> {statusFilter}
                  </span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span>
                    <strong>Plan Type:</strong> {planFilter}
                  </span>
                </span>
                {searchQuery.trim() && (
                  <span className="text-slate-700">
                    <strong>Search:</strong> &quot;{searchQuery.trim()}&quot;
                  </span>
                )}
              </div>

              <div className="font-bold text-slate-700">
                {deliveries.length} {deliveries.length === 1 ? "Delivery" : "Deliveries"} in Report
              </div>
            </div>

            {/* Deliveries Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3 w-64">Customer</th>
                    <th className="py-2.5 px-3 w-40">Mobile Number</th>
                    <th className="py-2.5 px-3">Delivery Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {deliveries.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        No deliveries found matching the current date and filter scope.
                      </td>
                    </tr>
                  ) : (
                    deliveries.map((item, idx) => {
                      const name = getCustomerName(item);
                      const mobile = getCustomerMobile(item);
                      return (
                        <tr
                          key={item.subscription_id || idx}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="font-bold text-slate-900 leading-tight">
                              {name}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {item.customer_email || "N/A"}
                            </p>
                            {item.subscription_id && (
                              <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                                Sub ID: {item.subscription_id.slice(0, 10)}...
                              </p>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800 text-xs font-mono">
                            {mobile}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">
                            <p className="leading-snug">{item.location_address || "No address provided"}</p>
                            {item.location_id && (
                              <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                                Loc ID: {item.location_id.slice(0, 8)}...
                              </p>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-1">
              <span>
                Nu3Go Healthy Meal Subscriptions • Confidential Daily Operations Manifest • www.nu3go.com
              </span>
              <span>Generated by Nu3Go Admin Portal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
