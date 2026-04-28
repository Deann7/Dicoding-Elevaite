"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, ScanLine, FileText, CheckCircle2, AlertTriangle, FileSearch, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function QaScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleScan = () => {
    if (!file) return;
    setIsScanning(true);
    setScanComplete(false);

    // Simulate AI Document Processing time
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
    }, 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-black text-white p-2">
          <FileSearch className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-widest">AI QA Auto-Release</h1>
          <p className="text-sm text-black/50 font-medium">
            Unggah dokumen hasil Lab/QC. AI akan mengekstrak data dan merilis status "UNRELEASED" secara otomatis.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <Card className="rounded-none border-black/20 shadow-none relative overflow-hidden">
          <CardHeader className="border-b border-black/10 bg-black/5">
            <CardTitle className="text-sm uppercase tracking-widest">Dokumen Inspeksi (PDF/IMG)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {!file ? (
              <div className="border-2 border-dashed border-black/20 p-12 text-center hover:bg-black/5 transition-colors relative">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FileUp className="h-10 w-10 mx-auto mb-4 text-black/40" />
                <p className="text-sm font-bold uppercase tracking-widest">Drag & Drop atau Klik</p>
                <p className="text-xs text-black/50 mt-1">Upload laporan lab baterai EV Anda</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 border border-black/10 bg-white">
                  <FileText className="h-8 w-8 text-black/60" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{file.name}</p>
                    <p className="text-xs text-black/50 font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setFile(null); setScanComplete(false); }} className="rounded-none text-xs uppercase font-bold">
                    Ganti
                  </Button>
                </div>
                
                <Button 
                  onClick={handleScan} 
                  disabled={isScanning}
                  className="w-full rounded-none h-12 font-bold uppercase tracking-widest text-xs bg-black text-white hover:bg-black/80"
                >
                  {isScanning ? (
                    <>Menganalisis Dokumen via AI...</>
                  ) : (
                    <><ScanLine className="mr-2 h-4 w-4" /> Mulai AI Ekstraksi</>
                  )}
                </Button>
              </div>
            )}

            {isScanning && (
              <div className="absolute inset-0 bg-black/5 backdrop-blur-sm flex flex-col items-center justify-center border-t-2 border-black animate-pulse">
                <ScanLine className="h-12 w-12 text-black mb-4 animate-bounce" />
                <div className="text-sm font-mono font-bold">OCR & NLP Engine Active...</div>
                <div className="text-xs text-black/60 mt-1">Membaca metrik Voltage & Impedance</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Result Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-black/50">Hasil Ekstraksi & Keputusan</h2>
          
          <AnimatePresence>
            {!scanComplete && !isScanning && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full border border-black/10 border-dashed flex flex-col items-center justify-center p-8 text-center text-black/40 min-h-[300px]">
                <FileSearch className="h-12 w-12 mb-3 opacity-20" />
                <p className="text-sm">Menunggu dokumen untuk diproses...</p>
              </motion.div>
            )}

            {scanComplete && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {/* Data Extraction Card */}
                <Card className="rounded-none border-black/20 shadow-none">
                  <CardContent className="p-0">
                    <div className="bg-black text-white p-3 flex justify-between items-center">
                      <span className="text-xs font-mono">Ekstraksi Dokumen Selesai</span>
                      <Badge variant="outline" className="rounded-none text-[10px] text-white border-white/30 bg-white/10 uppercase">
                        Confidence: 98.4%
                      </Badge>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-4 font-mono text-xs">
                      <div>
                        <p className="text-black/50 mb-1">Target Pallet</p>
                        <p className="font-bold text-sm">B-109</p>
                      </div>
                      <div>
                        <p className="text-black/50 mb-1">Batch Vendor</p>
                        <p className="font-bold text-sm">LG Chem</p>
                      </div>
                      <div className="pt-3 border-t border-black/10">
                        <p className="text-black/50 mb-1">Avg Voltage</p>
                        <p className="font-bold text-green-600">4.18V <span className="text-black/40 font-normal">(Target: &gt;4.1V)</span></p>
                      </div>
                      <div className="pt-3 border-t border-black/10">
                        <p className="text-black/50 mb-1">Impedance</p>
                        <p className="font-bold text-green-600">1.2mΩ <span className="text-black/40 font-normal">(Target: &lt;2.0mΩ)</span></p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Automation Action Card */}
                <Card className="rounded-none border-l-4 border-l-green-500 bg-green-50 border-y-black/10 border-r-black/10 shadow-none">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-green-800 text-sm uppercase tracking-wide">Auto-Release Berhasil</h3>
                        <p className="text-xs text-green-700/80 mt-1 leading-relaxed">
                          Metrik kualitas baterai memenuhi standar. Sistem secara otomatis telah mengubah status Pallet B-109 di database.
                        </p>
                        
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-green-200/50">
                          <Badge variant="outline" className="rounded-none border-black/20 text-black/50 line-through">
                            UNRELEASED
                          </Badge>
                          <ArrowRight className="h-4 w-4 text-green-600" />
                          <Badge className="rounded-none bg-green-500 hover:bg-green-600">
                            OK / RELEASED
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
