import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Activity, ScanLine, BatteryWarning, ShieldCheck, Database } from "lucide-react";
import Link from "next/link";

export default async function Page() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-16">
        {/* HERO SECTION */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center space-y-10 py-16">
          <Badge
            variant="outline"
            className="rounded-none border-border px-4 py-1.5 uppercase tracking-widest text-xs font-semibold bg-black/5"
          >
            <Activity className="h-3.5 w-3.5 mr-2" /> AI-Driven Inventory Automation
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter uppercase leading-[1.1]">
            Elevaite <br />
            <span className="text-muted-foreground">Volt-Guard</span>
          </h1>
          
          <p className="max-w-[800px] text-lg md:text-xl text-muted-foreground tracking-wide font-medium">
            Sistem manajemen inventaris pintar untuk manufaktur EV & Baterai. 
            Tinggalkan pencatatan manual. Otomatisasi pelacakan status barang 
            (On Hold, Unreleased, Reject) secara real-time untuk mencegah 
            keterlambatan produksi dan kesalahan fatal.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Link href="/dashboard/ev-monitor">
              <Button
                size="lg"
                className="rounded-none font-bold uppercase tracking-widest text-xs px-8 h-14 w-full sm:w-auto"
              >
                Coba Demo Interaktif <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="rounded-none font-bold uppercase tracking-widest text-xs px-8 h-14"
            >
              Lihat Solusi Kami
            </Button>
          </div>
        </section>

        {/* THE PROBLEM SECTION */}
        <section className="w-full bg-black text-white py-16 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-2">Core Problem</h2>
              <p className="text-2xl md:text-3xl font-bold uppercase tracking-tighter max-w-3xl mx-auto">
                Tantangan Manufaktur Modern: Ketergantungan Pada Proses Manual yang Rentan Kesalahan.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-t border-white/20 pt-12">
              <div className="space-y-4">
                <div className="h-12 w-12 bg-white/10 mx-auto flex items-center justify-center">
                  <Database className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold uppercase tracking-wide">Kesalahan Pencatatan</h3>
                <p className="text-white/60 text-sm">Human error dalam menginput status palet baterai menyebabkan data inventory tidak akurat.</p>
              </div>
              <div className="space-y-4">
                <div className="h-12 w-12 bg-white/10 mx-auto flex items-center justify-center">
                  <Activity className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold uppercase tracking-wide">Keterlambatan Proses</h3>
                <p className="text-white/60 text-sm">Bahan baku tertahan terlalu lama pada status "Unreleased" menunggu persetujuan QA secara manual.</p>
              </div>
              <div className="space-y-4">
                <div className="h-12 w-12 bg-red-500/20 mx-auto flex items-center justify-center">
                  <BatteryWarning className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-lg font-bold uppercase tracking-wide text-red-400">Rendahnya Visibilitas</h3>
                <p className="text-white/60 text-sm">Tidak ada notifikasi otomatis saat kondisi baterai menurun, berisiko cacat produksi atau bahaya kebakaran.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION (Opportunity Area) */}
        <section id="features" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="mb-12">
            <Badge variant="outline" className="mb-4 rounded-none font-bold uppercase tracking-widest text-[10px]">Opportunity Area</Badge>
            <h2 className="text-3xl font-bold uppercase tracking-tight">Solusi Terintegrasi Volt-Guard</h2>
            <p className="text-muted-foreground mt-2 text-lg">Mengubah tantangan menjadi efisiensi operasional.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="rounded-none border-border transition-all hover:bg-muted/50 cursor-pointer">
              <CardHeader>
                <ShieldCheck className="h-8 w-8 mb-4 text-foreground" />
                <CardTitle className="uppercase tracking-wide">AI-Based Inventory</CardTitle>
                <CardDescription className="text-base">
                  Prediksi degradasi & Auto-Quarantine.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  Sistem kami menganalisis data sensor IoT secara instan. Jika suhu palet melebihi batas aman, status otomatis berubah menjadi <strong>REJECT</strong> tanpa input manusia, mencegah risiko fatal.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-none border-border transition-all hover:bg-muted/50 cursor-pointer">
              <CardHeader>
                <ScanLine className="h-8 w-8 mb-4 text-foreground" />
                <CardTitle className="uppercase tracking-wide">Real-Time Tracking</CardTitle>
                <CardDescription className="text-base">
                  Visibilitas absolut pergerakan barang.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  Pantau setiap palet di berbagai zona pabrik melalui dashboard terpusat. Lihat status <strong>ON HOLD</strong> atau <strong>OK</strong> secara real-time untuk mempercepat pengambilan keputusan manajerial.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-none border-border transition-all hover:bg-muted/50 cursor-pointer md:col-span-2 lg:col-span-1">
              <CardHeader>
                <Activity className="h-8 w-8 mb-4 text-foreground" />
                <CardTitle className="uppercase tracking-wide">Inventory Automation</CardTitle>
                <CardDescription className="text-base">
                  Bot Copilot pelaporan insiden.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  Generative AI terintegrasi yang mampu menyusun laporan insiden secara otomatis berdasarkan anomali data, memangkas birokrasi dan keterlambatan proses administratif.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
        
        {/* ABOUT SECTION */}
        <section id="about" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center border-t border-border">
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Didesain khusus untuk AI Impact Challenge. Elevaite Volt-Guard menjembatani gap antara masalah manufaktur tradisional dan teknologi masa depan.
          </p>
        </section>
      </main>

      <footer className="w-full border-t border-border py-8 text-center text-sm font-medium tracking-wide text-muted-foreground uppercase bg-black text-white">
        <div className="max-w-7xl mx-auto px-4">
          © {new Date().getFullYear()} Elevaite Volt-Guard — Prototipe Manufaktur EV.
        </div>
      </footer>
    </>
  );
}

