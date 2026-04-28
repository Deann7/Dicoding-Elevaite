"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, ScanLine, FileText, CheckCircle2, AlertTriangle, FileSearch, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function QaScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto hide error message after 5 seconds
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

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
      
      await fetch("/api/qa/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pallet_code: data.metrics.palletCode,
          document_name: file.name,
          avg_voltage: data.metrics.avgVoltage,
          impedance: data.metrics.impedance,
          ai_confidence: data.metrics.confidence,
          passed_qa: data.metrics.isPass,
          fail_reason: data.metrics.isPass ? null : "Standar Voltase / Impedance tidak memenuhi syarat"
        })
      });

      setScanComplete(true);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 relative">
      {/* FLOATING ERROR NOTIFICATION */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-red-600 text-white shadow-2xl p-4 flex items-start gap-4 border-2 border-red-900">
              <AlertTriangle className="h-6 w-6 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-bold uppercase tracking-widest text-sm">Scan Failed</h4>
                <p className="text-xs mt-1 text-white/90 leading-relaxed">{errorMsg}</p>
              </div>
              <button onClick={() => setErrorMsg(null)} className="text-white/50 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3 mb-8">
        <div className="bg-black text-white p-3 shadow-lg">
          <FileSearch className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-widest">AI QA Scanner</h1>
          <p className="text-sm text-black/50 font-medium mt-1">
            Azure Document Intelligence Engine. Unggah laporan lab untuk validasi rilis palet baterai.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT COLUMN: UPLOAD SECTION */}
        <Card className="rounded-none border-black border-2 shadow-none relative overflow-hidden bg-white">
          <CardHeader className="border-b-2 border-black bg-black text-white p-4">
            <CardTitle className="text-sm uppercase tracking-widest font-bold flex items-center gap-2">
              <FileUp className="h-4 w-4" /> Upload Document
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {!file ? (
              <div className="border-2 border-dashed border-black/30 p-12 text-center hover:bg-black/5 transition-all duration-300 relative group cursor-pointer h-[300px] flex flex-col items-center justify-center">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="bg-black/5 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <FileUp className="h-10 w-10 text-black/60" />
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-black">Drag & Drop File Here</p>
                <p className="text-xs text-black/50 mt-2 max-w-[200px] mx-auto leading-relaxed">
                  Supported formats: PDF, JPEG, PNG, or TIFF.
                </p>
              </div>
            ) : (
              <div className="space-y-6 h-[300px] flex flex-col justify-between">
                <div className="relative border-2 border-black p-4 bg-black/5 overflow-hidden group">
                  {/* Laser Scanning Animation */}
                  {isScanning && (
                    <motion.div
                      initial={{ top: 0 }}
                      animate={{ top: "100%" }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-1 bg-blue-500 shadow-[0_0_15px_3px_rgba(59,130,246,0.5)] z-20"
                    />
                  )}
                  
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="bg-black text-white p-3">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{file.name}</p>
                      <p className="text-xs text-black/50 font-mono mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    {!isScanning && (
                      <Button variant="outline" size="sm" onClick={() => setFile(null)} className="rounded-none border-black text-xs uppercase font-bold hover:bg-black hover:text-white transition-colors">
                        Change
                      </Button>
                    )}
                  </div>

                  {isScanning && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-white">
                      <ScanLine className="h-10 w-10 mb-3 animate-pulse text-blue-400" />
                      <div className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400">Azure AI Analyzing...</div>
                      <div className="text-[10px] text-white/50 mt-2 uppercase tracking-widest">Extracting Telemetry Data</div>
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={handleScan} 
                  disabled={isScanning}
                  className="w-full rounded-none h-14 font-bold uppercase tracking-widest text-sm bg-black text-white hover:bg-black/90 transition-all border-2 border-black"
                >
                  {isScanning ? (
                    "Processing..."
                  ) : (
                    <>Analyze Document <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* RIGHT COLUMN: RESULT SECTION */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-black/50 flex items-center gap-2">
            <ScanLine className="h-4 w-4" /> AI Extraction Result
          </h2>
          
          <AnimatePresence mode="wait">
            {!scanComplete && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="h-full border-2 border-black/10 border-dashed flex flex-col items-center justify-center p-8 text-center text-black/40 min-h-[365px] bg-black/5"
              >
                <div className="bg-black/10 p-4 rounded-full mb-4">
                  <FileSearch className="h-10 w-10 text-black/40" />
                </div>
                <p className="text-sm font-bold uppercase tracking-widest">Awaiting Document</p>
                <p className="text-xs mt-2 max-w-[200px]">Upload a document on the left to see the AI extraction results here.</p>
              </motion.div>
            )}

            {scanComplete && scanResult && (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Data Extraction Card */}
                <Card className="rounded-none border-2 border-black shadow-none overflow-hidden">
                  <CardContent className="p-0">
                    <div className="bg-black text-white p-4 flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-400" /> Extraction Success
                      </span>
                      <Badge variant="outline" className="rounded-none text-[10px] text-white border-white/30 bg-white/10 uppercase font-mono">
                        Conf: {(scanResult.confidence * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="p-6 grid grid-cols-2 gap-6 font-mono text-sm bg-white">
                      <div>
                        <p className="text-xs text-black/50 mb-1 font-sans uppercase tracking-widest font-bold">Target Pallet</p>
                        <p className="font-bold text-lg">{scanResult.palletCode}</p>
                      </div>
                      <div>
                        <p className="text-xs text-black/50 mb-1 font-sans uppercase tracking-widest font-bold">Batch Vendor</p>
                        <p className="font-bold text-lg">{scanResult.vendor}</p>
                      </div>
                      <div className="pt-4 border-t border-black/10">
                        <p className="text-xs text-black/50 mb-1 font-sans uppercase tracking-widest font-bold">Avg Voltage</p>
                        <p className={`font-bold text-xl ${scanResult.avgVoltage >= 4.1 ? 'text-green-600' : 'text-red-600'}`}>
                          {scanResult.avgVoltage}V 
                          <span className="block text-[10px] text-black/40 font-normal mt-1 font-sans uppercase tracking-widest">Target: &gt;4.1V</span>
                        </p>
                      </div>
                      <div className="pt-4 border-t border-black/10">
                        <p className="text-xs text-black/50 mb-1 font-sans uppercase tracking-widest font-bold">Impedance</p>
                        <p className={`font-bold text-xl ${scanResult.impedance <= 2.0 ? 'text-green-600' : 'text-red-600'}`}>
                          {scanResult.impedance}mΩ 
                          <span className="block text-[10px] text-black/40 font-normal mt-1 font-sans uppercase tracking-widest">Target: &lt;2.0mΩ</span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Automation Action Card */}
                <Card className={`rounded-none border-2 shadow-none ${scanResult.isPass ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50'}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      {scanResult.isPass ? (
                        <div className="bg-green-600 p-2 shrink-0">
                          <CheckCircle2 className="h-6 w-6 text-white" />
                        </div>
                      ) : (
                        <div className="bg-red-600 p-2 shrink-0">
                          <AlertTriangle className="h-6 w-6 text-white" />
                        </div>
                      )}
                      <div>
                        <h3 className={`font-bold text-base uppercase tracking-widest ${scanResult.isPass ? 'text-green-800' : 'text-red-800'}`}>
                          {scanResult.isPass ? 'Auto-Release Approved' : 'Auto-Release Rejected'}
                        </h3>
                        <p className={`text-xs mt-2 leading-relaxed ${scanResult.isPass ? 'text-green-700/90' : 'text-red-700/90'}`}>
                          {scanResult.isPass 
                            ? `All quality metrics meet the minimum requirements. Pallet ${scanResult.palletCode} has been automatically released into inventory.`
                            : `Quality metrics failed to meet standards. Pallet ${scanResult.palletCode} has been sent to quarantine.`}
                        </p>
                        
                        <div className={`flex items-center gap-3 mt-4 pt-4 border-t ${scanResult.isPass ? 'border-green-600/20' : 'border-red-600/20'}`}>
                          <Badge variant="outline" className={`rounded-none font-bold uppercase tracking-widest text-[10px] ${scanResult.isPass ? 'border-green-600/50 text-green-700/50' : 'border-red-600/50 text-red-700/50'} line-through`}>
                            UNRELEASED
                          </Badge>
                          <ArrowRight className={`h-4 w-4 ${scanResult.isPass ? 'text-green-600' : 'text-red-600'}`} />
                          <Badge className={`rounded-none font-bold uppercase tracking-widest text-[10px] ${scanResult.isPass ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                            {scanResult.isPass ? 'OK / RELEASED' : 'REJECT / KARANTINA'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
