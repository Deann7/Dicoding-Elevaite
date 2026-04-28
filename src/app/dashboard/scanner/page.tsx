"use client";

import { useState } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  ScanFace,
  ArrowRight,
  Activity,
  Cpu,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type ScanResult = {
  documentId: string;
  docType: string;
  extractedData: {
    vendor: string;
    lotNumber: string;
    productionDate: string;
    moistureContent: string;
    qaStatusLabel: string;
  };
  confidence: number;
} | null;

export default function SmartScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult>(null);

  const simulateScan = () => {
    setIsScanning(true);
    setResult(null);

    // Simulate Azure Document Intelligence Delay
    setTimeout(() => {
      setResult({
        documentId: "COA-89102-X",
        docType: "Certificate of Analysis (COA)",
        extractedData: {
          vendor: "PT Indo Makmur Persada",
          lotNumber: "LOT-A1029",
          productionDate: "2026-04-05",
          moistureContent: "12.4% (PASS)",
          qaStatusLabel: "APPROVED",
        },
        confidence: 0.98,
      });
      setIsScanning(false);
    }, 3000);
  };

  const handleReset = () => {
    setResult(null);
    setIsScanning(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">
            AI Smart Scanner
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Azure Document Intelligence Integration. Mengotomatisasi entri data
            dan validasi status inventaris.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* LEFT COLUMN: UPLOAD / CAMERA ZONE */}
        <Card className="rounded-none border-black/20 shadow-none flex flex-col h-[400px]">
          <CardHeader className="border-b border-black/10 shrink-0">
            <CardTitle className="text-sm uppercase tracking-widest font-bold">
              Document Input
            </CardTitle>
            <CardDescription className="text-xs font-mono uppercase">
              Upload COA, Manifest, or Label
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col items-center justify-center relative">
            {!isScanning && !result && (
              <div
                className="w-full h-full border-2 border-dashed border-black/20 hover:border-black transition-colors flex flex-col items-center justify-center cursor-pointer group bg-[#fafafa]"
                onClick={simulateScan}
              >
                <div className="bg-black text-white p-4 mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud className="h-8 w-8" />
                </div>
                <p className="font-bold uppercase tracking-widest text-sm">
                  Click to Upload & Scan
                </p>
                <p className="text-xs text-black/50 font-mono mt-2">
                  Supports PDF, JPG, PNG
                </p>
              </div>
            )}

            {isScanning && (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="relative">
                  <FileText className="h-16 w-16 text-black/20" />
                  {/* Scanning Laser Line */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-black w-full animate-[scan_1.5s_ease-in-out_infinite]" />
                </div>
                <div className="mt-8 flex items-center gap-2 font-mono text-sm uppercase tracking-widest font-bold">
                  <Cpu className="h-4 w-4 animate-pulse" />
                  Extraksi AI Berjalan...
                </div>
                <p className="text-xs text-black/50 mt-2 font-medium">
                  Menghubungi Azure Cloud
                </p>
              </div>
            )}

            {result && (
              <div className="w-full h-full flex flex-col items-center justify-center text-center">
                <div className="bg-green-500 text-white p-4 rounded-full mb-4">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <p className="font-bold uppercase tracking-widest text-sm">
                  Scan Selesai
                </p>
                <div className="mt-6">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="rounded-none font-bold uppercase tracking-widest text-xs border-black text-black"
                  >
                    Scan Dokumen Lain
                  </Button>
                </div>
              </div>
            )}

            <style jsx>{`
              @keyframes scan {
                0% {
                  top: 0;
                  opacity: 1;
                }
                50% {
                  top: 100%;
                  opacity: 1;
                }
                100% {
                  top: 0;
                  opacity: 1;
                }
              }
            `}</style>
          </CardContent>
        </Card>

        {/* RIGHT COLUMN: RESULTS SUMMARY */}
        <Card className="rounded-none border-black/20 shadow-none flex flex-col h-[400px]">
          <CardHeader className="border-b border-black/10 shrink-0 bg-black text-white">
            <CardTitle className="text-sm uppercase tracking-widest font-bold">
              Extraction Summary
            </CardTitle>
            <CardDescription className="text-xs font-mono uppercase text-white/50">
              Data Parsed & Verified
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {!isScanning && !result && (
              <div className="p-6 flex flex-col items-center justify-center h-full text-black/40">
                <ScanFace className="h-12 w-12 mb-4 opacity-50" />
                <p className="font-mono text-xs uppercase tracking-widest text-center">
                  Menunggu input dokumen
                  <br />
                  untuk memulai analisis.
                </p>
              </div>
            )}

            {isScanning && (
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-black/10 rounded-none" />
                  <Skeleton className="h-6 w-full bg-black/5 rounded-none" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 bg-black/10 rounded-none" />
                  <Skeleton className="h-6 w-3/4 bg-black/5 rounded-none" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 bg-black/10 rounded-none" />
                  <Skeleton className="h-6 w-1/2 bg-black/5 rounded-none" />
                </div>
              </div>
            )}

            {result && (
              <div className="flex flex-col h-full">
                <div className="p-6 space-y-4 flex-1">
                  <div className="flex justify-between items-center pb-2 border-b border-black/10">
                    <span className="text-xs font-bold uppercase tracking-widest text-black/50">
                      Identitas Dokumen
                    </span>
                    <span className="font-mono text-sm font-bold">
                      {result.documentId}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-black/50 mb-1">
                        Lot Number
                      </p>
                      <p className="font-mono text-sm">
                        {result.extractedData.lotNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-black/50 mb-1">
                        Production
                      </p>
                      <p className="font-mono text-sm">
                        {result.extractedData.productionDate}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-black/50 mb-1">
                        Moisture Check
                      </p>
                      <p className="font-mono text-sm text-green-600 font-bold">
                        {result.extractedData.moistureContent}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-black/50 mb-1">
                        QA Label
                      </p>
                      <Badge
                        variant="outline"
                        className="rounded-none border-black text-[10px] font-bold uppercase"
                      >
                        {result.extractedData.qaStatusLabel}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* AUTOMATION ACTION BADGE */}
                <div className="p-4 bg-black/5 border-t border-black/20 m-4 border border-black relative overflow-auto">
                  <div className="flex items-start gap-3 relative z-10">
                    <Activity className="h-5 w-5 text-black shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest leading-tight">
                        Automated Action Triggered
                      </p>
                      <p className="text-[10px] font-mono mt-1 text-black/70">
                        Confidence{" "}
                        <span className="font-bold text-black border-b border-black">
                          {(result.confidence * 100).toFixed(0)}%
                        </span>
                        . Quality parameter met.
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="rounded-none bg-white border-black/20 text-black/50 text-[10px]"
                        >
                          UNRELEASED
                        </Badge>
                        <ArrowRight className="h-3 w-3" />
                        <Badge className="rounded-none bg-black text-white text-[10px]">
                          RELEASED
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
