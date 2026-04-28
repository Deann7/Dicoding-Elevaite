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

  const okCount = pallets.filter((p) => p.status === "OK").length;
  const holdCount = pallets.filter((p) => p.status === "ON HOLD").length;
  const rejectCount = pallets.filter((p) => p.status === "REJECT").length;

  return (
    <div className="flex h-full  -m-6 md:-m-8">
      {/* MAIN PANEL */}
      <div className="flex-1 flex flex-col ">
        {/* Header */}
        <div className="px-6 py-4 border-b border-black/10 bg-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-black text-white p-2">
                <Battery className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold uppercase tracking-widest leading-tight">
                  EV Battery Monitor
                </h1>
                <p className="text-xs text-black/50 font-mono">
                  Volt-Guard · Predictive Degradation & Auto-Quarantine
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Connection status */}
              <div
                className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2 py-1 border ${isConnected ? "text-green-700 border-green-300 bg-green-50" : "text-black/40 border-black/10 bg-black/5"}`}
              >
                <Wifi
                  className={`h-3 w-3 ${isConnected ? "text-green-600" : "text-black/30"}`}
                />
                {isConnected ? "Live" : "Demo Mode"}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="rounded-none border-black/20 h-8 gap-1.5 text-xs font-bold uppercase tracking-widest"
                onClick={() => setShowCopilot((prev) => !prev)}
              >
                <Bot className="h-3.5 w-3.5" />
                Copilot
              </Button>
            </div>
          </div>

          {/* KPI Bar */}
          <div className="flex gap-6 mt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="font-mono font-bold text-lg text-green-700">
                {okCount}
              </span>
              <span className="text-xs text-black/50 uppercase tracking-widest">
                OK
              </span>
            </div>
            <div className="w-px bg-black/10" />
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="font-mono font-bold text-lg text-yellow-700">
                {holdCount}
              </span>
              <span className="text-xs text-black/50 uppercase tracking-widest">
                On Hold
              </span>
            </div>
            <div className="w-px bg-black/10" />
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="font-mono font-bold text-lg text-red-700">
                {rejectCount}
              </span>
              <span className="text-xs text-black/50 uppercase tracking-widest">
                Reject
              </span>
            </div>
            <div className="w-px bg-black/10" />
            <div className="flex items-center gap-2">
              <Battery className="h-4 w-4 text-black/50" />
              <span className="font-mono font-bold text-lg">
                {pallets.length}
              </span>
              <span className="text-xs text-black/50 uppercase tracking-widest">
                Total Pallets
              </span>
            </div>
          </div>
        </div>

        {/* Live Alerts Ticker */}
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
                  className={`flex items-center gap-3 px-6 py-2 text-xs font-mono ${alert.type === "critical" ? "bg-red-600 text-white" : "bg-yellow-500 text-black"}`}
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

        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-sm text-black/50 font-mono">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading
            pallets...
          </div>
        ) : pallets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-black/50 font-mono text-sm">
            No pallets found in database.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pallets.map((pallet) => (
              <PalletCard
                key={pallet.id}
                pallet={pallet}
                isSelected={selectedPallet?.id === pallet.id}
                onSelect={handleSelectPallet}
              />
            ))}
          </div>
        )}
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
