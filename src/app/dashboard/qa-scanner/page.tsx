"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileUp,
  ScanLine,
  FileText,
  CheckCircle2,
  AlertTriangle,
  FileSearch,
  ArrowRight,
  X,
  Upload,
  Camera,
  Shield,
  Sparkles,
  Download,
  Send,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function QaScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; title: string; msg: string } | null>(null);

  // Auto hide error message after 5 seconds
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  // Auto hide toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setScanComplete(false);
      setScanResult(null);
      setErrorMsg(null);
    }
  };

  const handleScan = async () => {
    if (!file) return;
    setIsScanning(true);
    setScanComplete(false);
    setErrorMsg(null);
    setScanResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/qa/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menghubungi AI Server");
      }

      setScanResult(data.metrics);

      const releaseRes = await fetch("/api/qa/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pallet_code: data.metrics.palletCode,
          document_name: file.name,
          avg_voltage: data.metrics.avgVoltage,
          impedance: data.metrics.impedance,
          ai_confidence: data.metrics.confidence,
          passed_qa: data.metrics.isPass,
          fail_reason: data.metrics.isPass
            ? null
            : "Standar Voltase / Impedance tidak memenuhi syarat",
        }),
      });

      const releaseData = await releaseRes.json();
      if (!releaseRes.ok) throw new Error(releaseData.error || "Gagal menyimpan ke database");

      // Trigger Teams webhook langsung jika REJECT
      let teamsAlertSent = false;
      if (!data.metrics.isPass) {
        try {
          const teamsRes = await fetch("/api/webhooks/teams", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              record: {
                pallet_code: data.metrics.palletCode,
                new_status: "REJECT",
                trigger_source: "AI_QA_SCANNER",
                temperature_at_event: null,
                note: `Impedance ${data.metrics.impedance}mΩ / Voltage ${data.metrics.avgVoltage}V — tidak memenuhi standar QA`,
              },
            }),
          });
          const teamsData = await teamsRes.json();
          console.log("[QA Scanner] Teams webhook response:", teamsData);
          teamsAlertSent = teamsRes.ok && teamsData.success === true;
        } catch (teamsErr) {
          console.error("[QA Scanner] Gagal memanggil Teams webhook:", teamsErr);
          teamsAlertSent = false;
        }
      }

      setScanComplete(true);

      // Tampilkan toast sukses/gagal
      if (data.metrics.isPass) {
        setToast({
          type: "success",
          title: "✅ Data Berhasil Disimpan!",
          msg: `Pallet ${data.metrics.palletCode} telah masuk ke EV Battery Monitor dengan status OK / RELEASED.`,
        });
      } else {
        setToast({
          type: "error",
          title: "🚨 Pallet Ditolak & Dikarantina",
          msg: teamsAlertSent
            ? `Pallet ${data.metrics.palletCode} status REJECT. Data tersimpan & alert Teams berhasil terkirim.`
            : `Pallet ${data.metrics.palletCode} status REJECT. Data tersimpan, namun alert Teams GAGAL — cek MS_TEAMS_WEBHOOK_URL di .env & log terminal.`,
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 relative">
      {/* ── FLOATING NOTIFICATIONS ─────────────── */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            key="error-toast"
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="bg-red-600 text-white shadow-2xl rounded-xl p-4 flex items-start gap-4">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-heading font-bold text-sm">Scan Failed</h4>
                <p className="text-xs mt-1 text-white/90 leading-relaxed">{errorMsg}</p>
              </div>
              <button onClick={() => setErrorMsg(null)} className="text-white/50 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
        {toast && (
          <motion.div
            key="success-toast"
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <div
              className={`shadow-2xl rounded-xl p-4 flex items-start gap-4 ${
                toast.type === "success"
                  ? "bg-emerald-600 text-white"
                  : "bg-orange-600 text-white"
              }`}
            >
              <div className="flex-1">
                <h4 className="font-heading font-bold text-sm">{toast.title}</h4>
                <p className="text-xs mt-1 text-white/90 leading-relaxed">{toast.msg}</p>
              </div>
              <button onClick={() => setToast(null)} className="text-white/50 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER ──────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            AI QA Scanner
          </h1>
          <p className="text-slate-500 mt-2 text-base max-w-2xl">
            Automated quality assurance for battery manufacturing logs. Upload
            technical spec sheets or batch reports for instant AI-powered
            validation.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <span className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full font-data text-[10px] font-semibold uppercase tracking-widest border border-green-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Powered by Azure Document Intelligence
          </span>
        </div>
      </div>

      {/* ── MAIN LAYOUT GRID ───────────────────────── */}
      <div className="grid grid-cols-12 gap-5">
        {/* ── Left Column: Upload Area ─────────────── */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-5">
          {/* Upload Card */}
          <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            <div className="p-8">
              {!file ? (
                /* Drop zone */
                <div className="border-2 border-dashed border-primary/20 rounded-2xl p-12 text-center hover:bg-primary/[0.02] transition-all duration-300 relative group cursor-pointer flex flex-col items-center justify-center min-h-[320px]">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Upload className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">
                    Upload Technical Document
                  </h3>
                  <p className="text-slate-500 text-sm max-w-sm mb-8">
                    Drag and drop your PDF, XLSX, or JSON files here to begin
                    the automated QA inspection.
                  </p>
                  <div className="flex gap-4">
                    <button className="bg-primary text-white px-8 py-3 rounded-xl font-heading font-semibold text-sm flex items-center gap-2 hover:bg-primary/90 active:scale-[0.97] transition-all shadow-lg shadow-primary/20">
                      <Upload className="h-4 w-4" />
                      Browse Files
                    </button>
                    <button className="bg-slate-100 text-slate-700 px-8 py-3 rounded-xl font-heading font-semibold text-sm border border-slate-200 hover:bg-slate-200 transition-all">
                      <Camera className="h-4 w-4 inline mr-2" />
                      Use Camera
                    </button>
                  </div>

                  {/* File info badges */}
                  <div className="mt-10 grid grid-cols-3 gap-4 w-full max-w-lg">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <FileText className="h-5 w-5 text-slate-400 mx-auto mb-1.5" />
                      <p className="text-[10px] font-data text-slate-400 uppercase tracking-widest">
                        Max File Size
                      </p>
                      <p className="font-heading text-sm font-bold text-slate-700">
                        50 MB
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <Sparkles className="h-5 w-5 text-slate-400 mx-auto mb-1.5" />
                      <p className="text-[10px] font-data text-slate-400 uppercase tracking-widest">
                        Formats
                      </p>
                      <p className="font-heading text-sm font-bold text-slate-700">
                        PDF, JSON
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <Shield className="h-5 w-5 text-slate-400 mx-auto mb-1.5" />
                      <p className="text-[10px] font-data text-slate-400 uppercase tracking-widest">
                        Encryption
                      </p>
                      <p className="font-heading text-sm font-bold text-slate-700">
                        AES-256
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* File selected */
                <div className="space-y-6 min-h-[320px] flex flex-col justify-between">
                  <div className="relative bg-slate-50 border border-slate-200 rounded-xl p-5 overflow-hidden group">
                    {/* Laser Scanning Animation */}
                    {isScanning && (
                      <motion.div
                        initial={{ top: 0 }}
                        animate={{ top: "100%" }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_15px_3px_rgba(94,59,219,0.5)] z-20 rounded-full"
                      />
                    )}

                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-heading font-bold text-slate-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-400 font-data mt-1">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      {!isScanning && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setFile(null)}
                          className="rounded-xl border-slate-200 text-xs font-heading font-semibold"
                        >
                          Change
                        </Button>
                      )}
                    </div>

                    {isScanning && (
                      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-xl">
                        <Loader2 className="h-10 w-10 mb-3 animate-spin text-primary" />
                        <div className="text-xs font-heading font-bold text-primary">
                          Azure AI Analyzing...
                        </div>
                        <div className="text-[10px] text-white/50 mt-2 font-data uppercase tracking-widest">
                          Extracting Telemetry Data
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleScan}
                    disabled={isScanning}
                    className="w-full rounded-xl h-14 font-heading font-bold text-sm bg-primary text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.97] gap-2"
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Analyze Document
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Column: AI Extraction Result ───── */}
        <div className="col-span-12 lg:col-span-5">
          <AnimatePresence mode="wait">
            {!scanComplete && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-[#1A1C1E] rounded-2xl shadow-2xl border border-white/5 overflow-hidden min-h-[420px] flex flex-col"
              >
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-heading text-xl font-bold">
                      AI Extraction Result
                    </h3>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span
                        className="w-2 h-2 rounded-full bg-green-500 animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <span
                        className="w-2 h-2 rounded-full bg-green-500 animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                  </div>
                  <p className="text-slate-400 text-xs">
                    Real-time analytical breakdown of the latest document scan.
                  </p>
                </div>

                {/* Empty state */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                    <FileSearch className="h-8 w-8 text-white/20" />
                  </div>
                  <p className="text-white/40 font-heading text-sm font-medium">
                    Awaiting Document
                  </p>
                  <p className="text-white/20 text-xs mt-2 max-w-[200px]">
                    Upload a document on the left to see the AI extraction
                    results here.
                  </p>
                </div>
              </motion.div>
            )}

            {scanComplete && scanResult && (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#1A1C1E] rounded-2xl shadow-2xl border border-white/5 overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-heading text-xl font-bold">
                      AI Extraction Result
                    </h3>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span
                        className="w-2 h-2 rounded-full bg-green-500 animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <span
                        className="w-2 h-2 rounded-full bg-green-500 animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                  </div>
                  <p className="text-slate-400 text-xs">
                    Real-time analytical breakdown of the latest document scan.
                  </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                  {/* Confidence Bar */}
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-slate-400 font-data text-[10px] uppercase tracking-widest">
                        Extraction Confidence
                      </p>
                      <p className="text-primary font-data text-xl font-medium">
                        {(scanResult.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(94,59,219,0.5)] transition-all duration-1000"
                        style={{
                          width: `${scanResult.confidence * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Detected Parameters */}
                  <div className="space-y-3">
                    <h4 className="text-white text-xs font-data uppercase tracking-widest border-l-2 border-primary pl-3">
                      Detected Parameters
                    </h4>
                    <div className="space-y-2">
                      {/* Target Pallet */}
                      <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-all">
                        <div>
                          <p className="text-slate-500 text-[10px] font-data uppercase tracking-widest mb-1">
                            Target Pallet
                          </p>
                          <p className="text-white font-heading text-sm font-bold">
                            {scanResult.palletCode}
                          </p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>

                      {/* Avg Voltage */}
                      <div
                        className={`border rounded-xl p-4 flex items-center justify-between transition-all ${
                          scanResult.avgVoltage >= 4.1
                            ? "bg-white/5 border-white/5 hover:bg-white/10"
                            : "bg-red-500/5 border-red-500/20 hover:bg-red-500/10"
                        }`}
                      >
                        <div>
                          <p
                            className={`text-[10px] font-data uppercase tracking-widest mb-1 ${
                              scanResult.avgVoltage >= 4.1
                                ? "text-slate-500"
                                : "text-red-400/60"
                            }`}
                          >
                            Avg Voltage
                          </p>
                          <p
                            className={`font-heading text-sm font-bold ${
                              scanResult.avgVoltage >= 4.1
                                ? "text-white"
                                : "text-red-400"
                            }`}
                          >
                            {scanResult.avgVoltage}V
                          </p>
                        </div>
                        {scanResult.avgVoltage >= 4.1 ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                      </div>

                      {/* Impedance */}
                      <div
                        className={`border rounded-xl p-4 flex items-center justify-between transition-all ${
                          scanResult.impedance <= 2.0
                            ? "bg-white/5 border-white/5 hover:bg-white/10"
                            : "bg-red-500/5 border-red-500/20 hover:bg-red-500/10"
                        }`}
                      >
                        <div>
                          <p
                            className={`text-[10px] font-data uppercase tracking-widest mb-1 ${
                              scanResult.impedance <= 2.0
                                ? "text-slate-500"
                                : "text-red-400/60"
                            }`}
                          >
                            Impedance
                          </p>
                          <p
                            className={`font-heading text-sm font-bold ${
                              scanResult.impedance <= 2.0
                                ? "text-white"
                                : "text-red-400"
                            }`}
                          >
                            {scanResult.impedance}mΩ
                          </p>
                        </div>
                        {scanResult.impedance <= 2.0 ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI Analysis box */}
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <p className="text-primary font-data text-[10px] uppercase tracking-widest">
                        AI Cognitive Analysis
                      </p>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed italic">
                      {scanResult.isPass
                        ? `All quality metrics meet the minimum requirements. Pallet ${scanResult.palletCode} from ${scanResult.vendor} has been automatically released into inventory.`
                        : `Quality metrics failed to meet standards. The detected impedance of ${scanResult.impedance}mΩ exceeds the 2.0mΩ threshold. Recommend immediate manual inspection.`}
                    </p>
                  </div>

                  {/* Status transition */}
                  <div
                    className={`p-4 rounded-xl border ${
                      scanResult.isPass
                        ? "bg-green-500/5 border-green-500/20"
                        : "bg-red-500/5 border-red-500/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {scanResult.isPass ? (
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center shrink-0">
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center shrink-0">
                          <AlertTriangle className="h-5 w-5 text-red-400" />
                        </div>
                      )}
                      <div>
                        <h3
                          className={`font-heading font-bold text-sm ${
                            scanResult.isPass
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {scanResult.isPass
                            ? "Auto-Release Approved"
                            : "Auto-Release Rejected"}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="rounded-full text-[10px] font-bold bg-white/10 text-white/40 line-through border-0">
                            UNRELEASED
                          </Badge>
                          <ArrowRight
                            className={`h-3 w-3 ${
                              scanResult.isPass
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          />
                          <Badge
                            className={`rounded-full text-[10px] font-bold border-0 ${
                              scanResult.isPass
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-red-500 hover:bg-red-600"
                            }`}
                          >
                            {scanResult.isPass
                              ? "OK / RELEASED"
                              : "REJECT / QUARANTINE"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
