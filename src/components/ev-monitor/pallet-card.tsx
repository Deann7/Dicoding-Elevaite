"use client";

import { Pallet, PalletStatus } from "@/types/pallet";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Droplets, MapPin, Cpu, AlertTriangle, CheckCircle2, Clock, ArrowRight } from "lucide-react";
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
        borderClass: "",
        badgeClass: "bg-green-50 text-green-700 border-green-200",
        iconClass: "text-green-500",
        icon: CheckCircle2,
        label: "Released",
        tempColor: "text-slate-900",
        humidityColor: "text-slate-900",
        bgGlow: "",
        alertBorder: "",
      };
    case "ON HOLD":
      return {
        borderClass: "",
        badgeClass: "bg-yellow-50 text-yellow-700 border-yellow-200",
        iconClass: "text-yellow-500",
        icon: Clock,
        label: "On Hold",
        tempColor: "text-yellow-600",
        humidityColor: "text-yellow-600",
        bgGlow: "",
        alertBorder: "",
      };
    case "REJECT":
      return {
        borderClass: "border-red-300",
        badgeClass: "bg-red-50 text-red-700 border-red-200",
        iconClass: "text-red-600",
        icon: AlertTriangle,
        label: "Critical",
        tempColor: "text-red-600",
        humidityColor: "text-red-600",
        bgGlow: "",
        alertBorder: "ring-2 ring-red-200",
      };
    case "UNRELEASED":
      return {
        borderClass: "",
        badgeClass: "bg-primary/10 text-primary border-primary/20",
        iconClass: "text-primary",
        icon: Clock,
        label: "Pending QA",
        tempColor: "text-slate-900",
        humidityColor: "text-slate-900",
        bgGlow: "",
        alertBorder: "",
      };
    default:
      return {
        borderClass: "",
        badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
        iconClass: "text-slate-500",
        icon: Clock,
        label: "Unknown",
        tempColor: "text-slate-600",
        humidityColor: "text-slate-600",
        bgGlow: "",
        alertBorder: "",
      };
  }
}

export function PalletCard({ pallet, isSelected, onSelect }: PalletCardProps) {
  const config = getStatusConfig(pallet.status);
  const StatusIcon = config.icon;
  const isAnomaly = pallet.status === "REJECT" || pallet.status === "ON HOLD";
  const isCritical = pallet.status === "REJECT";
  const isHighHumidity = (pallet.humidity ?? 0) > 65;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => onSelect(pallet)}
      className={cn(
        "relative bg-white border border-slate-100 rounded-2xl cursor-pointer p-6 transition-all duration-300 group shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-lg",
        config.alertBorder,
        isSelected && "ring-2 ring-primary ring-offset-2",
      )}
    >
      {/* Header: Unit ID + Status Badge */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <span className="font-data text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Unit ID
          </span>
          <h3 className="font-heading text-2xl font-bold text-slate-900 mt-0.5">
            {pallet.pallet_code}
          </h3>
        </div>
        <Badge
          className={cn(
            "rounded-full text-[10px] font-bold uppercase tracking-wider border px-2.5 py-1 gap-1",
            config.badgeClass,
          )}
        >
          <StatusIcon className="h-3 w-3" />
          {config.label}
        </Badge>
      </div>

      {/* Temperature & Humidity Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className={cn(
              "font-data text-[10px] font-semibold uppercase tracking-widest",
              isCritical ? "text-red-500" : "text-slate-400"
            )}>
              Temperature
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={cn("font-data text-3xl font-medium", config.tempColor)}>
              {pallet.temperature}
            </span>
            <span className={cn("font-data text-sm", config.tempColor)}>°C</span>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className={cn(
              "font-data text-[10px] font-semibold uppercase tracking-widest",
              isHighHumidity ? "text-red-500" : "text-slate-400"
            )}>
              Humidity
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={cn(
              "font-data text-3xl font-medium",
              isHighHumidity ? "text-red-600" : config.humidityColor
            )}>
              {pallet.humidity ?? "--"}
            </span>
            <span className={cn(
              "font-data text-sm",
              isHighHumidity ? "text-red-600" : "text-slate-500"
            )}>%</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Alert reason or status indicator */}
        <div className="flex-1 min-w-0">
          {pallet.alert_reason ? (
            <p className={cn(
              "text-xs font-semibold truncate",
              isCritical ? "text-red-600" : "text-yellow-600"
            )}>
              {isCritical ? "⚡ Shutdown Required" : "⚠ " + pallet.alert_reason.slice(0, 40)}
            </p>
          ) : pallet.status === "UNRELEASED" ? (
            <p className="text-xs text-slate-400 font-medium">
              In Queue · {pallet.location}
            </p>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                pallet.status === "OK" ? "bg-green-500" : "bg-slate-400"
              )} />
              <span className="text-xs text-slate-500 font-data uppercase tracking-wider">
                {pallet.status === "OK" ? "Steady" : pallet.location}
              </span>
            </div>
          )}
        </div>

        {/* Action link */}
        <button className="text-primary text-xs font-heading font-semibold flex items-center gap-1 hover:underline opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {isCritical ? "Action" : "View Specs"}
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </motion.div>
  );
}
