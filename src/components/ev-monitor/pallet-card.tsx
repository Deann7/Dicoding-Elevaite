"use client";

import { Pallet, PalletStatus } from "@/types/pallet";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Droplets, MapPin, Cpu, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
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
        borderClass: "border-l-4 border-l-green-500",
        badgeClass: "bg-green-100 text-green-800 border-green-300",
        iconClass: "text-green-500",
        icon: CheckCircle2,
        label: "OK / Released",
        tempColor: "text-green-600",
        bgGlow: "",
      };
    case "ON HOLD":
      return {
        borderClass: "border-l-4 border-l-yellow-500",
        badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-300",
        iconClass: "text-yellow-500",
        icon: Clock,
        label: "On Hold",
        tempColor: "text-yellow-600",
        bgGlow: "bg-yellow-50/50",
      };
    case "REJECT":
      return {
        borderClass: "border-l-4 border-l-red-600",
        badgeClass: "bg-red-100 text-red-800 border-red-300",
        iconClass: "text-red-600",
        icon: AlertTriangle,
        label: "REJECT / Quarantine",
        tempColor: "text-red-600 font-bold",
        bgGlow: "bg-red-50/70",
      };
    case "UNRELEASED":
      return {
        borderClass: "border-l-4 border-l-blue-500",
        badgeClass: "bg-blue-100 text-blue-800 border-blue-300",
        iconClass: "text-blue-500",
        icon: Clock,
        label: "Pending QA",
        tempColor: "text-blue-600",
        bgGlow: "bg-blue-50/40",
      };
    default:
      return {
        borderClass: "border-l-4 border-l-gray-400",
        badgeClass: "bg-gray-100 text-gray-800 border-gray-300",
        iconClass: "text-gray-500",
        icon: Clock,
        label: "Unknown",
        tempColor: "text-gray-600",
        bgGlow: "",
      };
  }
}

export function PalletCard({ pallet, isSelected, onSelect }: PalletCardProps) {
  const config = getStatusConfig(pallet.status);
  const StatusIcon = config.icon;
  const isAnomaly = pallet.status !== "OK";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => onSelect(pallet)}
      className={cn(
        "relative border border-black/10 cursor-pointer p-4 transition-all duration-300 group",
        config.borderClass,
        config.bgGlow,
        isSelected && "ring-2 ring-black ring-offset-1",
        "hover:shadow-md"
      )}
    >
      {/* Pulse animation for REJECT status */}
      {pallet.status === "REJECT" && (
        <div className="absolute inset-0 border-2 border-red-500 animate-pulse pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-base">{pallet.pallet_code}</span>
            {isAnomaly && <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-black/50">
            <MapPin className="h-3 w-3" />
            <span>{pallet.location}</span>
          </div>
        </div>
        <Badge className={cn("rounded-none text-[10px] font-bold uppercase tracking-wider border", config.badgeClass)}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {config.label}
        </Badge>
      </div>

      {/* Temperature & Humidity */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-black/5 p-2">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-black/50 mb-1">
            <Thermometer className="h-3 w-3" />
            Temp
          </div>
          <div className={cn("font-mono text-lg font-bold", config.tempColor)}>
            {pallet.temperature}°C
          </div>
        </div>
        <div className="bg-black/5 p-2">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-black/50 mb-1">
            <Droplets className="h-3 w-3" />
            Humidity
          </div>
          <div className="font-mono text-lg font-bold text-black/70">
            {pallet.humidity ?? "--"}%
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between text-[10px] text-black/40 font-mono">
        <div className="flex items-center gap-1">
          <Cpu className="h-3 w-3" />
          <span>{pallet.cell_count} cells · {pallet.vendor_name}</span>
        </div>
        <span>
          {new Date(pallet.last_updated).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
      </div>

      {/* Alert reason */}
      {pallet.alert_reason && (
        <div className="mt-2 p-2 bg-red-600 text-white text-[10px] font-mono leading-relaxed">
          ⚡ {pallet.alert_reason}
        </div>
      )}
    </motion.div>
  );
}
