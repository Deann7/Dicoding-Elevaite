"use client";

import { useState } from "react";
import { Pallet } from "@/types/pallet";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Loader2, FileText, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";
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
        className="w-[380px] bg-white border-l border-black/10 flex flex-col h-full shrink-0"
      >
        {/* Panel Header */}
        <div className="bg-black text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white text-black p-1.5">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold uppercase tracking-widest text-sm leading-tight">
                Volt-Guard Copilot
              </p>
              <p className="text-[10px] text-white/50 font-mono">AI Safety Officer · Active</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Selected Pallet Summary */}
        {selectedPallet ? (
          <div className={`p-4 border-b shrink-0 ${isAnomaly ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
            <div className="flex items-center gap-2 mb-2">
              {isAnomaly ? (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
              <span className="font-mono font-bold text-sm">{selectedPallet.pallet_code}</span>
              <span className={`text-xs font-bold uppercase tracking-widest ml-auto ${isAnomaly ? "text-red-600" : "text-green-600"}`}>
                {selectedPallet.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-black/60">
              <div><span className="font-bold block">TEMP</span>{selectedPallet.temperature}°C</div>
              <div><span className="font-bold block">HUMID</span>{selectedPallet.humidity ?? "--"}%</div>
              <div><span className="font-bold block">CELLS</span>{selectedPallet.cell_count}</div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-black/40 text-sm border-b shrink-0">
            <Bot className="h-8 w-8 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Select a pallet card to start analysis</p>
          </div>
        )}

        {/* Report Area */}
        <ScrollArea className="flex-1 bg-[#fafafa]">
          <div className="p-4">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-black/40">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm font-medium">AI is generating incident report...</p>
                <p className="text-xs font-mono">Analyzing thermal data & cross-referencing SOP...</p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm font-mono">
                ⚠️ {error}
              </div>
            )}

            {report && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-black/10 p-4"
              >
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-black/10">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Generated Incident Report</span>
                </div>
                <pre className="text-[11px] font-mono text-black/80 whitespace-pre-wrap leading-relaxed">
                  {report}
                </pre>
              </motion.div>
            )}

            {!loading && !report && !error && selectedPallet && (
              <div className="space-y-3 py-4">
                <p className="text-xs text-black/50 font-medium uppercase tracking-widest mb-4">AI can help you:</p>
                {[
                  "Generate formal incident report",
                  "Assess thermal runaway risk",
                  "Draft evacuation instructions",
                  "Log to traceability system",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-black/60 border border-black/10 p-2 bg-white">
                    <ChevronRight className="h-3 w-3 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="p-4 border-t border-black/10 space-y-2 shrink-0 bg-white">
          <Button
            className="w-full rounded-none bg-black text-white hover:bg-black/80 h-10 font-bold uppercase tracking-widest text-xs gap-2"
            onClick={generateReport}
            disabled={!selectedPallet || loading}
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
            ) : (
              <><FileText className="h-4 w-4" /> Generate Incident Report</>
            )}
          </Button>
          {report && (
            <Button
              variant="outline"
              className="w-full rounded-none h-9 font-bold uppercase tracking-widest text-xs border-black/20"
              onClick={() => {
                const blob = new Blob([report], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `incident-${selectedPallet?.pallet_code}-${Date.now()}.txt`;
                a.click();
              }}
            >
              Download Report (.txt)
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
