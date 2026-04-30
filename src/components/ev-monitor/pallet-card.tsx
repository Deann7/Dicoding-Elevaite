"use client";

import { Pallet, PalletStatus } from "@/types/pallet";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Droplets, MapPin, Cpu, AlertTriangle, CheckCircle2, Clock, ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PalletCardProps {
  pallet: Pallet;
  isSelected: boolean;
  onSelect: (pallet: Pallet) => void;
}

function getStatusConfig(status: PalletStatus) {
  switch (status) {
    case "OK":
      return {
        badgeClass: "bg-green-50 text-green-700 border-green-200",
        iconClass: "text-green-500",
        icon: CheckCircle2,
        label: "Released",
        accentColor: "bg-green-500",
        cardBorder: "border-slate-100",
        selectedBorder: "ring-primary",
        glow: "",
        tempBarColor: "bg-green-400",
        labelColor: "text-slate-500",
        valueColor: "text-slate-900",
      };
    case "ON HOLD":
      return {
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        iconClass: "text-amber-500",
        icon: Clock,
        label: "On Hold",
        accentColor: "bg-amber-400",
        cardBorder: "border-amber-200",
        selectedBorder: "ring-amber-400",
        glow: "shadow-amber-100",
        tempBarColor: "bg-amber-400",
        labelColor: "text-amber-600",
        valueColor: "text-amber-700",
      };
    case "REJECT":
      return {
        badgeClass: "bg-red-50 text-red-700 border-red-200",
        iconClass: "text-red-600",
        icon: AlertTriangle,
        label: "Critical",
        accentColor: "bg-red-500",
        cardBorder: "border-red-200",
        selectedBorder: "ring-red-400",
        glow: "shadow-red-100",
        tempBarColor: "bg-red-500",
        labelColor: "text-red-500",
        valueColor: "text-red-700",
      };
    case "UNRELEASED":
      return {
        badgeClass: "bg-primary/10 text-primary border-primary/20",
        iconClass: "text-primary",
        icon: Clock,
        label: "Pending QA",
        accentColor: "bg-primary",
        cardBorder: "border-slate-100",
        selectedBorder: "ring-primary",
        glow: "",
        tempBarColor: "bg-primary/50",
        labelColor: "text-slate-500",
        valueColor: "text-slate-900",
      };
    default:
      return {
        badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
        iconClass: "text-slate-500",
        icon: Clock,
        label: "Unknown",
        accentColor: "bg-slate-400",
        cardBorder: "border-slate-100",
        selectedBorder: "ring-slate-300",
        glow: "",
        tempBarColor: "bg-slate-300",
        labelColor: "text-slate-400",
        valueColor: "text-slate-600",
      };
  }
}

// Safe temperature: 15–35°C → 0–100%
function getTempPercent(temp: number) {
  return Math.min(100, Math.max(0, ((temp - 15) / 25) * 100));
}
function getHumidityPercent(h: number) {
  return Math.min(100, Math.max(0, h));
}

export function PalletCard({ pallet, isSelected, onSelect }: PalletCardProps) {
  const config = getStatusConfig(pallet.status);
  const StatusIcon = config.icon;
  const isCritical = pallet.status === "REJECT";
  const isAnomaly = pallet.status === "REJECT" || pallet.status === "ON HOLD";
  const isHighHumidity = (pallet.humidity ?? 0) > 65;
  const tempPct = getTempPercent(pallet.temperature ?? 25);
  const humPct = getHumidityPercent(pallet.humidity ?? 50);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={() => onSelect(pallet)}
      className={cn(
        "relative bg-white rounded-2xl cursor-pointer transition-all duration-200 overflow-hidden group",
        "border shadow-sm hover:shadow-md",
        config.cardBorder,
        isAnomaly && "shadow-md " + config.glow,
        isSelected && `ring-2 ${config.selectedBorder} ring-offset-2`,
      )}
    >
      {/* Left accent bar */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl", config.accentColor)} />

      {/* Pulse overlay for critical */}
      {isCritical && (
        <div className="absolute inset-0 bg-red-500/[0.03] animate-pulse pointer-events-none" />
      )}

      <div className="pl-5 pr-5 pt-5 pb-4">
        {/* ── Row 1: ID + Badge ────────────────── */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] font-data font-semibold text-slate-400 uppercase tracking-widest">Unit ID</p>
            <h3 className="font-heading text-2xl font-bold text-slate-900 mt-0.5 leading-none">
              {pallet.pallet_code}
            </h3>
            {pallet.vendor_name && (
              <p className="text-[11px] text-slate-400 font-data mt-1">{pallet.vendor_name}</p>
            )}
          </div>
          <Badge className={cn("rounded-full text-[10px] font-bold uppercase tracking-wide border px-2.5 py-1 gap-1 shrink-0", config.badgeClass)}>
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>

        {/* ── Row 2: Temperature ────────────────── */}
        <div className="space-y-3 mb-4">
          {/* Temperature */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1">
                <Thermometer className={cn("h-3 w-3", isCritical ? "text-red-500" : "text-slate-400")} />
                <span className={cn("text-[10px] font-data font-semibold uppercase tracking-widest", config.labelColor)}>
                  Temperature
                </span>
              </div>
              <span className={cn("font-data text-base font-bold", config.valueColor)}>
                {pallet.temperature ?? "--"}°C
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${tempPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={cn("h-full rounded-full", config.tempBarColor)}
              />
            </div>
          </div>

          {/* Humidity */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1">
                <Droplets className={cn("h-3 w-3", isHighHumidity ? "text-red-500" : "text-slate-400")} />
                <span className={cn("text-[10px] font-data font-semibold uppercase tracking-widest", isHighHumidity ? "text-red-500" : "text-slate-400")}>
                  Humidity
                </span>
              </div>
              <span className={cn("font-data text-base font-bold", isHighHumidity ? "text-red-700" : config.valueColor)}>
                {pallet.humidity ?? "--"}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${humPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                className={cn("h-full rounded-full", isHighHumidity ? "bg-red-400" : "bg-sky-400")}
              />
            </div>
          </div>
        </div>

        {/* ── Row 3: Footer ───────────────────── */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex-1 min-w-0">
            {pallet.alert_reason ? (
              <p className={cn("text-xs font-semibold truncate flex items-center gap-1", isCritical ? "text-red-600" : "text-amber-600")}>
                {isCritical ? <Zap className="h-3 w-3 shrink-0" /> : "⚠"}
                {isCritical ? "Shutdown Required" : pallet.alert_reason.slice(0, 36) + "..."}
              </p>
            ) : (
              <div className="flex items-center gap-1.5">
                <div className={cn("w-1.5 h-1.5 rounded-full", pallet.status === "OK" ? "bg-green-500 animate-pulse" : "bg-slate-300")} />
                <span className="text-[11px] text-slate-400 font-data uppercase tracking-wide">
                  {pallet.status === "OK" ? "Steady" : pallet.location ?? "—"}
                </span>
              </div>
            )}
          </div>

          <button className="text-primary text-[11px] font-heading font-bold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
            {isCritical ? "Action" : "Detail"}
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Bottom metadata strip for location */}
      {pallet.location && !isAnomaly && (
        <div className="flex items-center gap-1.5 px-5 py-2 bg-slate-50 border-t border-slate-100">
          <MapPin className="h-3 w-3 text-slate-300" />
          <span className="text-[10px] font-data text-slate-400 truncate">{pallet.location}</span>
          {pallet.cell_count && (
            <>
              <span className="text-slate-200 mx-1">·</span>
              <Cpu className="h-3 w-3 text-slate-300" />
              <span className="text-[10px] font-data text-slate-400">{pallet.cell_count} cells</span>
            </>
          )}
        </div>
      )}

      {/* Alert reason strip for anomalies */}
      {isAnomaly && pallet.alert_reason && (
        <div className={cn("px-5 py-2 border-t text-[11px] font-data leading-snug truncate", isCritical ? "bg-red-50 border-red-100 text-red-600" : "bg-amber-50 border-amber-100 text-amber-700")}>
          {pallet.alert_reason}
        </div>
      )}
    </motion.div>
  );
}
