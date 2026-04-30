"use client";

import { useState } from "react";
import { Pallet } from "@/types/pallet";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Loader2, FileText, AlertTriangle, CheckCircle2, ChevronRight, Sparkles, Download, Thermometer, Droplets, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CopilotPanelProps {
  selectedPallet: Pallet | null;
  onClose: () => void;
}

export function CopilotPanel({ selectedPallet, onClose }: CopilotPanelProps) {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    if (!selectedPallet) return;
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await fetch("/api/copilot/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pallet_id: selectedPallet.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate report");
      setReport(data.report);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const isAnomaly = selectedPallet?.status !== "OK";

  return (
    <AnimatePresence>
      <motion.div
        key="copilot-panel"
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full md:w-[380px] bg-[#1A1C1E] flex flex-col h-full shrink-0 shadow-2xl rounded-t-3xl md:rounded-none"
      >
        {/* ── Panel Header ───────────────────────────── */}
        <div className="p-5 border-b border-white/10 bg-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-white font-heading font-bold text-sm leading-tight">
                Volt-Guard Copilot
              </p>
              <p className="text-[10px] text-white/40 font-data uppercase tracking-widest">
                AI Safety Officer · Active
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Selected Pallet Summary ────────────────── */}
        {selectedPallet ? (
          <div className="p-5 border-b border-white/10 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {isAnomaly ? (
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  </div>
                )}
                <span className="text-white font-heading font-bold text-lg">
                  {selectedPallet.pallet_code}
                </span>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isAnomaly
                    ? "bg-red-500/20 text-red-400"
                    : "bg-green-500/20 text-green-400"
                }`}
              >
                {selectedPallet.status}
              </span>
            </div>

            {/* Data pills */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                <div className="flex items-center gap-1 mb-1">
                  <Thermometer className="h-3 w-3 text-white/30" />
                  <span className="text-[10px] font-data text-white/40 uppercase tracking-widest">
                    Temp
                  </span>
                </div>
                <span className="text-white font-data text-base font-medium">
                  {selectedPallet.temperature}°C
                </span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                <div className="flex items-center gap-1 mb-1">
                  <Droplets className="h-3 w-3 text-white/30" />
                  <span className="text-[10px] font-data text-white/40 uppercase tracking-widest">
                    Humid
                  </span>
                </div>
                <span className="text-white font-data text-base font-medium">
                  {selectedPallet.humidity ?? "--"}%
                </span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                <div className="flex items-center gap-1 mb-1">
                  <Cpu className="h-3 w-3 text-white/30" />
                  <span className="text-[10px] font-data text-white/40 uppercase tracking-widest">
                    Cells
                  </span>
                </div>
                <span className="text-white font-data text-base font-medium">
                  {selectedPallet.cell_count}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center border-b border-white/10 shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Bot className="h-8 w-8 text-white/20" />
            </div>
            <p className="text-white/40 font-heading text-sm font-medium">
              Select a pallet card to start analysis
            </p>
          </div>
        )}

        {/* ── Report Area ────────────────────────────── */}
        <ScrollArea className="flex-1">
          <div className="p-5">
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-white/30">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-7 w-7 animate-spin text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-heading font-medium text-white/50">
                    Generating incident report...
                  </p>
                  <p className="text-xs font-data text-white/30 mt-1">
                    Analyzing thermal data & cross-referencing SOP
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-heading font-bold text-xs">Error</span>
                </div>
                <p className="text-xs leading-relaxed">{error}</p>
              </div>
            )}

            {report && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Report card */}
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-xs font-heading font-bold text-white/80">
                      Generated Incident Report
                    </span>
                  </div>
                  <div className="p-4">
                    <pre className="text-[11px] font-mono text-white/70 whitespace-pre-wrap leading-relaxed">
                      {report}
                    </pre>
                  </div>
                </div>
              </motion.div>
            )}

            {!loading && !report && !error && selectedPallet && (
              <div className="space-y-2 py-2">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="text-[10px] text-white/40 font-data uppercase tracking-widest">
                    AI can help you
                  </p>
                </div>
                {[
                  "Generate formal incident report",
                  "Assess thermal runaway risk",
                  "Draft evacuation instructions",
                  "Log to traceability system",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm text-white/60 bg-white/5 border border-white/5 rounded-xl p-3 hover:bg-white/10 transition-colors cursor-pointer group"
                  >
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-primary/60 group-hover:text-primary transition-colors" />
                    <span className="font-heading text-xs">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* ── Action Buttons ─────────────────────────── */}
        <div className="p-5 border-t border-white/10 bg-white/5 space-y-2 shrink-0">
          <Button
            className="w-full rounded-xl bg-primary text-white hover:bg-primary/90 h-11 font-heading font-bold text-xs gap-2 shadow-lg shadow-primary/20"
            onClick={generateReport}
            disabled={!selectedPallet || loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" /> Generate Incident Report
              </>
            )}
          </Button>
          {report && (
            <Button
              variant="outline"
              className="w-full rounded-xl h-10 font-heading font-bold text-xs border-white/10 text-white/60 hover:bg-white/10 hover:text-white gap-2"
              onClick={() => {
                const blob = new Blob([report], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `incident-${selectedPallet?.pallet_code}-${Date.now()}.txt`;
                a.click();
              }}
            >
              <Download className="h-4 w-4" />
              Download Report (.txt)
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
