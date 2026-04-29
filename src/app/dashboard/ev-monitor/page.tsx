"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Pallet } from "@/types/pallet";
import { PalletCard } from "@/components/ev-monitor/pallet-card";
import { CopilotPanel } from "@/components/ev-monitor/copilot-panel";
import { motion, AnimatePresence } from "framer-motion";
import {
  Battery,
  BatteryWarning,
  Bot,
  RefreshCw,
  Wifi,
  AlertTriangle,
  CheckCircle2,
  Clock,
  X,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// --- MOCK DATA for when Supabase table doesn't exist yet ---
const MOCK_PALLETS: Pallet[] = [
  {
    id: "1",
    pallet_code: "B-101",
    temperature: 22,
    humidity: 48,
    status: "OK",
    location: "Zone A · Rack 1",
    cell_count: 48,
    vendor_name: "CATL",
    last_updated: new Date().toISOString(),
    alert_reason: null,
  },
  {
    id: "2",
    pallet_code: "B-102",
    temperature: 24,
    humidity: 51,
    status: "OK",
    location: "Zone A · Rack 2",
    cell_count: 48,
    vendor_name: "CATL",
    last_updated: new Date().toISOString(),
    alert_reason: null,
  },
  {
    id: "3",
    pallet_code: "B-103",
    temperature: 26,
    humidity: 55,
    status: "OK",
    location: "Zone B · Rack 1",
    cell_count: 96,
    vendor_name: "LG Chem",
    last_updated: new Date().toISOString(),
    alert_reason: null,
  },
  {
    id: "4",
    pallet_code: "B-104",
    temperature: 28,
    humidity: 59,
    status: "OK",
    location: "Zone B · Rack 2",
    cell_count: 96,
    vendor_name: "LG Chem",
    last_updated: new Date().toISOString(),
    alert_reason: null,
  },
  {
    id: "5",
    pallet_code: "B-105",
    temperature: 37,
    humidity: 66,
    status: "ON HOLD",
    location: "Zone C · Rack 1",
    cell_count: 48,
    vendor_name: "Panasonic",
    last_updated: new Date().toISOString(),
    alert_reason:
      "WARNING: Temperature 37°C above safe range (35°C). Pending inspection.",
  },
  {
    id: "6",
    pallet_code: "B-106",
    temperature: 21,
    humidity: 45,
    status: "OK",
    location: "Zone C · Rack 2",
    cell_count: 72,
    vendor_name: "Samsung SDI",
    last_updated: new Date().toISOString(),
    alert_reason: null,
  },
  {
    id: "7",
    pallet_code: "B-107",
    temperature: 23,
    humidity: 50,
    status: "OK",
    location: "Zone D · Rack 1",
    cell_count: 72,
    vendor_name: "Samsung SDI",
    last_updated: new Date().toISOString(),
    alert_reason: null,
  },
  {
    id: "8",
    pallet_code: "B-108",
    temperature: 25,
    humidity: 52,
    status: "OK",
    location: "Zone D · Rack 2",
    cell_count: 48,
    vendor_name: "CATL",
    last_updated: new Date().toISOString(),
    alert_reason: null,
  },
];

type AlertEntry = { id: string; message: string; type: "warn" | "critical" };

export default function EvMonitorPage() {
  const [pallets, setPallets] = useState<Pallet[]>([]);
  const [selectedPallet, setSelectedPallet] = useState<Pallet | null>(null);
  const [showCopilot, setShowCopilot] = useState(false);
  const [liveAlerts, setLiveAlerts] = useState<AlertEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "alerts">("all");
  const itemsPerPage = 6;
  const supabase = createClient();

  // Try to subscribe to Supabase Realtime and fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      const { data } = await supabase
        .from("pallets")
        .select("*")
        .order("pallet_code");
      if (data) setPallets(data);
      setIsLoading(false);
    };

    fetchInitialData();

    const channel = supabase
      .channel("pallets-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "pallets" },
        (payload) => {
          const updated = payload.new as Pallet;
          setIsConnected(true);

          setPallets((prev) =>
            prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)),
          );

          // Update selected pallet if it's the one being updated
          setSelectedPallet((prev) =>
            prev?.id === updated.id ? { ...prev, ...updated } : prev,
          );

          // Fire alert if status changed to danger
          if (updated.status === "REJECT" || updated.status === "ON HOLD") {
            const alertEntry: AlertEntry = {
              id: Date.now().toString(),
              message: `${updated.pallet_code}: ${updated.alert_reason ?? updated.status}`,
              type: updated.status === "REJECT" ? "critical" : "warn",
            };
            setLiveAlerts((prev) => [alertEntry, ...prev.slice(0, 4)]);
            // Auto-select the affected pallet and open copilot
            if (updated.status === "REJECT") {
              setSelectedPallet(updated);
              setShowCopilot(true);
            }
          }
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setIsConnected(true);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleSelectPallet = useCallback((pallet: Pallet) => {
    setSelectedPallet(pallet);
    setShowCopilot(true);
  }, []);

  // Filter logic
  const filteredPallets =
    filter === "alerts"
      ? pallets.filter((p) => p.status !== "OK")
      : pallets;

  // Pagination logic
  const totalPages = Math.ceil(filteredPallets.length / itemsPerPage);
  const currentPallets = filteredPallets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const okCount = pallets.filter((p) => p.status === "OK").length;
  const holdCount = pallets.filter((p) => p.status === "ON HOLD").length;
  const rejectCount = pallets.filter((p) => p.status === "REJECT").length;

  return (
    <div className="flex h-full -m-6 md:-m-10">
      {/* MAIN PANEL */}
      <div className="flex-1 flex flex-col">
        {/* ── Header ──────────────────────────────────── */}
        <div className="px-6 md:px-10 py-6 bg-[#f8f9ff] shrink-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                EV Battery Monitor
              </h1>
              <p className="text-slate-500 mt-1 text-base">
                Real-time telemetry and QA status for line B-100 units.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => { setFilter("all"); setCurrentPage(1); }}
                  className={`px-4 py-2 text-sm font-heading font-semibold transition-colors ${
                    filter === "all"
                      ? "bg-primary text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  All Units
                </button>
                <button
                  onClick={() => { setFilter("alerts"); setCurrentPage(1); }}
                  className={`px-4 py-2 text-sm font-heading font-semibold transition-colors ${
                    filter === "alerts"
                      ? "bg-primary text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Alerts Only
                </button>
              </div>

              {/* Connection Status */}
              <div
                className={`hidden sm:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-xl border ${
                  isConnected
                    ? "text-green-700 border-green-200 bg-green-50"
                    : "text-slate-400 border-slate-200 bg-white"
                }`}
              >
                <Wifi
                  className={`h-3 w-3 ${isConnected ? "text-green-600" : "text-slate-300"}`}
                />
                {isConnected ? "Live" : "Demo"}
              </div>

              {/* Copilot Toggle */}
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-slate-200 h-9 gap-1.5 text-xs font-heading font-semibold hover:bg-slate-50"
                onClick={() => setShowCopilot((prev) => !prev)}
              >
                <Bot className="h-3.5 w-3.5" />
                Copilot
              </Button>
            </div>
          </div>
        </div>

        {/* ── Live Alerts Ticker ──────────────────────── */}
        <AnimatePresence>
          {liveAlerts.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="shrink-0"
            >
              {liveAlerts.slice(0, 1).map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center gap-3 px-6 md:px-10 py-2.5 text-xs font-data ${
                    alert.type === "critical"
                      ? "bg-red-600 text-white"
                      : "bg-yellow-500 text-black"
                  }`}
                >
                  <BatteryWarning className="h-4 w-4 shrink-0 animate-pulse" />
                  <span className="font-bold uppercase tracking-widest">
                    {alert.type === "critical"
                      ? "⚡ CRITICAL ALERT:"
                      : "⚠️ WARNING:"}
                  </span>
                  <span className="flex-1">{alert.message}</span>
                  <button
                    onClick={() =>
                      setLiveAlerts((prev) =>
                        prev.filter((a) => a.id !== alert.id),
                      )
                    }
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PALLET GRID ─────────────────────────────── */}
        <div className="p-6 md:p-10 flex-1 overflow-auto pb-24 bg-[#f8f9ff]">
          {isLoading ? (
            <div className="flex items-center justify-center h-40 text-sm text-slate-400 font-data">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading
              pallets...
            </div>
          ) : filteredPallets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 font-data text-sm">
              {filter === "alerts"
                ? "No alerts detected. All units are operational."
                : "No pallets found in database."}
            </div>
          ) : (
            <div className="flex flex-col h-full justify-between gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {currentPallets.map((pallet) => (
                  <PalletCard
                    key={pallet.id}
                    pallet={pallet}
                    isSelected={selectedPallet?.id === pallet.id}
                    onSelect={handleSelectPallet}
                  />
                ))}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-auto border-t border-slate-200 pt-4">
                  <p className="text-xs font-medium text-slate-400 font-data uppercase tracking-widest hidden sm:block">
                    Showing {(currentPage - 1) * itemsPerPage + 1}-
                    {Math.min(currentPage * itemsPerPage, filteredPallets.length)} of{" "}
                    {filteredPallets.length} pallets
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-slate-200 text-xs font-heading font-semibold"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Prev
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className={`rounded-xl border-slate-200 text-xs font-heading font-semibold w-8 h-8 p-0 ${
                            currentPage === i + 1
                              ? "bg-primary text-white border-primary hover:bg-primary/90"
                              : "hover:bg-slate-50"
                          }`}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-slate-200 text-xs font-heading font-semibold"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* COPILOT SIDE PANEL */}
      <AnimatePresence>
        {showCopilot && (
          <CopilotPanel
            selectedPallet={selectedPallet}
            onClose={() => setShowCopilot(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
