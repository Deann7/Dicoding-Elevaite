"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Pallet } from "@/types/pallet";
import { PalletCard } from "@/components/ev-monitor/pallet-card";
import { CopilotPanel } from "@/components/ev-monitor/copilot-panel";
import { motion, AnimatePresence } from "framer-motion";
import {
  BatteryWarning,
  Bot,
  RefreshCw,
  Wifi,
  WifiOff,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Battery,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- MOCK DATA for when Supabase table doesn't exist yet ---
const MOCK_PALLETS: Pallet[] = [
  { id: "1", pallet_code: "B-101", temperature: 22, humidity: 48, status: "OK", location: "Zone A · Rack 1", cell_count: 48, vendor_name: "CATL", last_updated: new Date().toISOString(), alert_reason: null },
  { id: "2", pallet_code: "B-102", temperature: 24, humidity: 51, status: "OK", location: "Zone A · Rack 2", cell_count: 48, vendor_name: "CATL", last_updated: new Date().toISOString(), alert_reason: null },
  { id: "3", pallet_code: "B-103", temperature: 26, humidity: 55, status: "OK", location: "Zone B · Rack 1", cell_count: 96, vendor_name: "LG Chem", last_updated: new Date().toISOString(), alert_reason: null },
  { id: "4", pallet_code: "B-104", temperature: 28, humidity: 59, status: "OK", location: "Zone B · Rack 2", cell_count: 96, vendor_name: "LG Chem", last_updated: new Date().toISOString(), alert_reason: null },
  { id: "5", pallet_code: "B-105", temperature: 37, humidity: 66, status: "ON HOLD", location: "Zone C · Rack 1", cell_count: 48, vendor_name: "Panasonic", last_updated: new Date().toISOString(), alert_reason: "WARNING: Temperature 37°C above safe range (35°C). Pending inspection." },
  { id: "6", pallet_code: "B-106", temperature: 21, humidity: 45, status: "OK", location: "Zone C · Rack 2", cell_count: 72, vendor_name: "Samsung SDI", last_updated: new Date().toISOString(), alert_reason: null },
  { id: "7", pallet_code: "B-107", temperature: 23, humidity: 50, status: "OK", location: "Zone D · Rack 1", cell_count: 72, vendor_name: "Samsung SDI", last_updated: new Date().toISOString(), alert_reason: null },
  { id: "8", pallet_code: "B-108", temperature: 41, humidity: 70, status: "REJECT", location: "Zone D · Rack 2", cell_count: 48, vendor_name: "CATL", last_updated: new Date().toISOString(), alert_reason: "CRITICAL: Thermal runaway detected. Immediate isolation required." },
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

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data } = await supabase.from("pallets").select("*").order("pallet_code");
      if (data && data.length > 0) setPallets(data);
      else setPallets(MOCK_PALLETS);
      setIsLoading(false);
    };
    fetchInitialData();

    const channel = supabase
      .channel("pallets-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "pallets" }, (payload) => {
        const inserted = payload.new as Pallet;
        setIsConnected(true);
        setPallets((prev) => {
          if (prev.find((p) => p.id === inserted.id)) return prev;
          return [...prev, inserted];
        });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "pallets" }, (payload) => {
        const updated = payload.new as Pallet;
        setIsConnected(true);
        setPallets((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
        setSelectedPallet((prev) => (prev?.id === updated.id ? { ...prev, ...updated } : prev));
        if (updated.status === "REJECT" || updated.status === "ON HOLD") {
          const alertEntry: AlertEntry = {
            id: Date.now().toString(),
            message: `${updated.pallet_code}: ${updated.alert_reason ?? updated.status}`,
            type: updated.status === "REJECT" ? "critical" : "warn",
          };
          setLiveAlerts((prev) => [alertEntry, ...prev.slice(0, 4)]);
          if (updated.status === "REJECT") { setSelectedPallet(updated); setShowCopilot(true); }
        }
      })
      .subscribe((status) => { if (status === "SUBSCRIBED") setIsConnected(true); });

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const handleSelectPallet = useCallback((pallet: Pallet) => {
    setSelectedPallet(pallet);
    setShowCopilot(true);
  }, []);

  const filteredPallets = filter === "alerts" ? pallets.filter((p) => p.status !== "OK") : pallets;
  const totalPages = Math.ceil(filteredPallets.length / itemsPerPage);
  const currentPallets = filteredPallets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const okCount = pallets.filter((p) => p.status === "OK").length;
  const holdCount = pallets.filter((p) => p.status === "ON HOLD").length;
  const rejectCount = pallets.filter((p) => p.status === "REJECT").length;
  const alertCount = holdCount + rejectCount;

  return (
    <div className="flex flex-col h-full -m-6 md:-m-10 bg-[#f4f6fc]">

      {/* ── HEADER ───────────────────────────────────── */}
      <div className="shrink-0 bg-white border-b border-slate-100 px-5 md:px-10 pt-6 pb-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              EV Battery Monitor
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest`}>
                {isConnected ? (
                  <><Wifi className="h-3 w-3 text-green-500" /><span className="text-green-600">Live · Realtime</span></>
                ) : (
                  <><WifiOff className="h-3 w-3 text-slate-300" /><span className="text-slate-400">Demo Mode</span></>
                )}
              </div>
              {isConnected && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
            </div>
          </div>

          {/* Copilot toggle — always visible */}
          <button
            onClick={() => setShowCopilot((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-heading font-bold transition-all ${
              showCopilot
                ? "bg-primary text-white shadow-lg shadow-primary/30"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Bot className="h-4 w-4" />
            AI Copilot
          </button>
        </div>

        {/* ── KPI STAT BAR ─────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] font-data font-semibold text-slate-400 uppercase tracking-widest">Released</p>
              <p className="text-xl font-bold text-slate-900 font-data leading-none mt-0.5">{okCount}</p>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-[10px] font-data font-semibold text-slate-400 uppercase tracking-widest">On Hold</p>
              <p className="text-xl font-bold text-yellow-600 font-data leading-none mt-0.5">{holdCount}</p>
            </div>
          </div>
          <div className="bg-slate-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-[10px] font-data font-semibold text-slate-400 uppercase tracking-widest">Rejected</p>
              <p className={`text-xl font-bold font-data leading-none mt-0.5 ${rejectCount > 0 ? "text-red-600" : "text-slate-900"}`}>{rejectCount}</p>
            </div>
          </div>
        </div>

        {/* ── FILTER TABS ──────────────────────────── */}
        <div className="flex items-center gap-2 mt-4">
          {(["all", "alerts"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setFilter(tab); setCurrentPage(1); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
                filter === tab
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-primary/30 hover:text-primary"
              }`}
            >
              {tab === "all" ? (
                <><Battery className="h-3 w-3" /> All Units <span className="opacity-70">({pallets.length})</span></>
              ) : (
                <><AlertTriangle className="h-3 w-3" /> Alerts Only {alertCount > 0 && <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${filter === "alerts" ? "bg-white/20" : "bg-red-500 text-white"}`}>{alertCount}</span>}</>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── LIVE ALERT TICKER ────────────────────────── */}
      <AnimatePresence>
        {liveAlerts.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="shrink-0">
            {liveAlerts.slice(0, 1).map((alert) => (
              <div key={alert.id} className={`flex items-center gap-3 px-5 md:px-10 py-2.5 text-xs font-data ${alert.type === "critical" ? "bg-red-600 text-white" : "bg-amber-500 text-black"}`}>
                <BatteryWarning className="h-4 w-4 shrink-0 animate-pulse" />
                <span className="font-bold uppercase tracking-widest">{alert.type === "critical" ? "⚡ CRITICAL:" : "⚠ WARNING:"}</span>
                <span className="flex-1 truncate">{alert.message}</span>
                <button onClick={() => setLiveAlerts((prev) => prev.filter((a) => a.id !== alert.id))} className="shrink-0 opacity-70 hover:opacity-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN BODY (grid + copilot) ─────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Pallet Grid */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm font-data gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" /> Loading pallets...
            </div>
          ) : filteredPallets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm font-data gap-2">
              <CheckCircle2 className="h-8 w-8 text-green-400" />
              {filter === "alerts" ? "No alerts. All units are operational." : "No pallets found."}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {currentPallets.map((pallet) => (
                  <PalletCard
                    key={pallet.id}
                    pallet={pallet}
                    isSelected={selectedPallet?.id === pallet.id}
                    onSelect={handleSelectPallet}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <p className="text-xs text-slate-400 font-data hidden sm:block">
                    {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredPallets.length)} of {filteredPallets.length}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm" className="rounded-xl w-9 h-9 p-0 border-slate-200" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <Button key={i} variant="outline" size="sm" onClick={() => setCurrentPage(i + 1)}
                        className={`rounded-xl w-9 h-9 p-0 text-xs font-heading font-bold border-slate-200 ${currentPage === i + 1 ? "bg-primary text-white border-primary hover:bg-primary/90" : "hover:bg-slate-50"}`}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    <Button variant="outline" size="sm" className="rounded-xl w-9 h-9 p-0 border-slate-200" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── COPILOT SIDEBAR (desktop) ─────────────── */}
        <AnimatePresence>
          {showCopilot && (
            <motion.div
              key="copilot-desktop"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="hidden md:flex shrink-0 overflow-hidden border-l border-slate-200"
            >
              <div className="w-[380px] h-full">
                <CopilotPanel selectedPallet={selectedPallet} onClose={() => setShowCopilot(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── COPILOT BOTTOM SHEET (mobile) ────────────── */}
      <AnimatePresence>
        {showCopilot && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-30 md:hidden"
              onClick={() => setShowCopilot(false)}
            />
            {/* Sheet */}
            <motion.div
              key="copilot-mobile"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-40 md:hidden rounded-t-3xl overflow-hidden shadow-2xl"
              style={{ height: "75vh" }}
            >
              <CopilotPanel selectedPallet={selectedPallet} onClose={() => setShowCopilot(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
