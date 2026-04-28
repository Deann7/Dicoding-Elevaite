"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock, X, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const message = searchParams.get("message");
  const reason = searchParams.get("reason");
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [showAccessModal, setShowAccessModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reason === "unauthenticated") {
      setShowAccessModal(true);
    }
  }, [reason]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Email atau password salah. Silakan coba lagi."
          : error.message
      );
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex bg-white text-black selection:bg-black selection:text-white">
      {/* --- LEFT PANEL: Branding --- */}
      <div className="hidden lg:flex w-1/2 bg-black flex-col justify-between p-12 relative overflow-hidden">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <Image
              src="/images/logo.png"
              alt="Elevaite Logo"
              width={50}
              height={60}
              className="brightness-0 invert"
            />
            <span className="text-white font-bold text-xl uppercase tracking-widest">
              Elevaite
            </span>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/80 text-xs font-mono uppercase tracking-widest">
                System Online
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              VOLT-GUARD
              <br />
              <span className="text-white/40">Command Center</span>
            </h1>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Platform pemantauan baterai EV berbasis AI secara real-time.
              Akses hanya untuk operator terverifikasi.
            </p>
          </div>
        </div>

        <div className="relative space-y-4">
          {[
            { label: "Real-Time Telemetry", desc: "IoT-powered monitoring" },
            { label: "AI QA Auto-Release", desc: "Azure Document Intelligence" },
            { label: "Immutable Audit Trail", desc: "Full event traceability" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 text-white/60 border-l-2 border-white/20 pl-4"
            >
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-white/80">
                  {item.label}
                </div>
                <div className="text-[10px] font-mono text-white/40">
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- RIGHT PANEL: Login Form --- */}
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-4">
            <Image src="/images/logo.png" alt="Logo" width={36} height={44} />
            <span className="font-bold text-lg uppercase tracking-widest">
              Volt-Guard
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-bold uppercase tracking-widest">
              Operator Sign In
            </h2>
            <p className="text-black/50 text-sm mt-1">
              Masuk untuk mengakses dashboard monitoring.
            </p>
          </div>

          {/* General Error */}
          {(error || message) && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">
                {error || message}
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="uppercase tracking-widest text-[10px] font-bold text-black/60"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="operator@factory.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-none border-black/20 h-12 focus-visible:ring-black/50 font-mono text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="uppercase tracking-widest text-[10px] font-bold text-black/60"
                >
                  Password
                </Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-[10px] text-black/50 font-medium underline underline-offset-4 hover:text-black uppercase tracking-widest"
                >
                  Forgot Password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-none border-black/20 h-12 focus-visible:ring-black/50"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-none h-12 bg-black text-white hover:bg-black/80 font-bold uppercase tracking-widest text-xs gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Sign In to Dashboard
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-black/50">
            Belum punya akun?{" "}
            <Link
              href="/auth/register"
              className="underline underline-offset-4 font-bold text-black hover:text-black/70"
            >
              Daftar Sekarang
            </Link>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-black/30 font-mono uppercase tracking-widest">
            <Shield className="h-3 w-3" />
            Data Anda diproteksi dengan Row-Level Security
          </div>
        </div>
      </div>

      {/* --- ACCESS DENIED MODAL --- */}
      {showAccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md mx-4 border border-black/10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Modal Header */}
            <div className="bg-black p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-red-500 p-2">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold uppercase tracking-widest text-sm">
                    Akses Ditolak
                  </p>
                  <p className="text-white/50 font-mono text-[10px]">
                    VOLT-GUARD SECURITY GATE
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAccessModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-800">
                    Area Terproteksi
                  </p>
                  <p className="text-xs text-red-700 mt-1 leading-relaxed">
                    Halaman yang Anda coba akses hanya untuk operator yang
                    terverifikasi. Silakan masuk dengan akun Anda untuk
                    melanjutkan.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-black/50 font-mono">
                <div className="flex justify-between border-b border-black/5 pb-1">
                  <span>Status</span>
                  <span className="text-red-600 font-bold">UNAUTHENTICATED</span>
                </div>
                <div className="flex justify-between border-b border-black/5 pb-1">
                  <span>Target Route</span>
                  <span className="text-black">{redirect}</span>
                </div>
                <div className="flex justify-between">
                  <span>Required Role</span>
                  <span className="text-black">authenticated</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-black/10 bg-black/5 flex gap-3">
              <Button
                onClick={() => setShowAccessModal(false)}
                className="flex-1 rounded-none h-10 bg-black text-white hover:bg-black/80 font-bold uppercase tracking-widest text-xs"
              >
                Masuk Sekarang
              </Button>
              <Link href="/" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full rounded-none h-10 border-black/20 font-bold uppercase tracking-widest text-xs"
                >
                  Kembali ke Beranda
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
