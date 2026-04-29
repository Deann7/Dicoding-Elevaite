"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock, X, AlertTriangle, Loader2, Mail, Eye, EyeOff, ArrowRight, Zap } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex bg-background text-foreground">
      {/* ── LEFT PANEL: Technical Visual ──────────────── */}
      <section className="hidden lg:flex lg:w-1/2 bg-slate-950 relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Logo at top */}
        <Link href="/" className="absolute top-8 left-12 z-20 flex items-center gap-2.5 group">
          <Image src="/images/logo.png" alt="Elevaite Logo" width={40} height={48} className="brightness-0 invert opacity-80 group-hover:opacity-100 transition-opacity" />
          <span className="text-white/80 group-hover:text-white font-heading font-bold text-lg tracking-tight transition-colors">
            Volt-Guard
          </span>
        </Link>

        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(94,59,219,0.2)_0%,rgba(94,59,219,0)_70%)] opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />

        {/* Hero Image */}
        <div className="relative z-10 w-full max-w-lg aspect-square flex items-center justify-center">
          <Image
            src="/images/hero-energy-core.png"
            alt="Volt-Guard Energy Architecture"
            width={600}
            height={600}
            className="w-full h-full object-cover rounded-3xl mix-blend-screen opacity-90 shadow-2xl"
          />
          {/* Glass Overlay */}
          <div className="absolute inset-0 rounded-3xl flex flex-col justify-end p-8 bg-white/[0.03] backdrop-blur-sm border border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-primary" />
                <span className="text-white/60 font-data uppercase tracking-widest text-[10px]">
                  Real-Time Diagnostic Core
                </span>
              </div>
              <h2 className="text-white font-heading text-4xl md:text-[42px] font-bold leading-tight">
                Advanced Energy Monitoring.
              </h2>
              <p className="text-white/40 text-base max-w-sm">
                Precision battery management systems for next-generation industrial infrastructures.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom decorative */}
        <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center opacity-30">
          <div className="flex gap-4">
            <div className="w-12 h-1 bg-white/20 rounded-full" />
            <div className="w-12 h-1 bg-primary/40 rounded-full" />
            <div className="w-12 h-1 bg-white/20 rounded-full" />
          </div>
          <span className="text-white text-[10px] font-data uppercase tracking-widest">
            System Status: Optimal
          </span>
        </div>
      </section>

      {/* ── RIGHT PANEL: Login Form ──────────────────── */}
      <section className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center p-8 sm:p-12 md:p-24 relative">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="lg:hidden mb-12 flex items-center gap-2">
            <Image src="/images/logo.png" alt="Logo" width={36} height={44} />
            <span className="font-heading text-xl font-bold tracking-tight">
              Volt-Guard
            </span>
          </div>

          {/* Form Header */}
          <header className="mb-10">
            <h1 className="text-slate-900 font-heading font-extrabold text-4xl mb-3">
              Sign In
            </h1>
            <p className="text-slate-500 text-base">
              Enter your credentials to access the monitoring suite.
            </p>
          </header>

          {/* Error Message */}
          {(error || message) && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">
                {error || message}
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="block text-slate-700 font-heading font-semibold text-sm">
                Corporate Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-[18px] w-[18px]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 h-14 bg-slate-50 border-slate-200 border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="block text-slate-700 font-heading font-semibold text-sm">
                  Security Key
                </Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-primary font-heading font-semibold text-xs hover:underline underline-offset-4"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-[18px] w-[18px]" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 h-14 bg-slate-50 border-slate-200 border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </div>

            {/* Primary Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-[#4c2fc0] text-white font-heading font-bold py-4 rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Authenticate System
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <footer className="mt-16 text-center">
            <p className="text-slate-400 text-sm">
              Belum punya akun?{" "}
              <Link
                href="/auth/register"
                className="text-primary font-bold hover:underline underline-offset-4"
              >
                Daftar Sekarang
              </Link>
            </p>
          </footer>

          {/* Security notice */}
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-300 font-data uppercase tracking-widest mt-6">
            <Shield className="h-3 w-3" />
            Data Anda diproteksi dengan Row-Level Security
          </div>
        </div>

        {/* Bottom footer */}
        <footer className="w-full border-t border-slate-100 flex flex-col md:flex-row justify-between items-center px-8 py-6 absolute bottom-0 left-0 right-0">
          <div className="text-sm font-bold text-slate-900 font-heading">
            © {new Date().getFullYear()} Elevaite Volt-Guard.
          </div>
          <div className="flex items-center gap-8 mt-4 md:mt-0">
            <span className="font-heading text-xs text-slate-400 font-normal">
              AI Impact Challenge
            </span>
          </div>
        </footer>
      </section>

      {/* ── ACCESS DENIED MODAL ──────────────────────── */}
      {showAccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md mx-4 rounded-2xl border border-slate-200 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-950 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-red-500 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-heading font-bold text-sm">
                    Akses Ditolak
                  </p>
                  <p className="text-white/50 font-data text-[10px]">
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
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
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

              <div className="space-y-2 text-xs text-slate-500 font-data">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span>Status</span>
                  <span className="text-red-600 font-bold">UNAUTHENTICATED</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span>Target Route</span>
                  <span className="text-slate-900">{redirect}</span>
                </div>
                <div className="flex justify-between">
                  <span>Required Role</span>
                  <span className="text-slate-900">authenticated</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button
                onClick={() => setShowAccessModal(false)}
                className="flex-1 h-10 bg-primary text-white hover:bg-primary/90 font-heading font-bold text-xs rounded-xl transition-all"
              >
                Masuk Sekarang
              </button>
              <Link href="/" className="flex-1">
                <button className="w-full h-10 border border-slate-200 text-slate-700 font-heading font-bold text-xs rounded-xl hover:bg-slate-100 transition-all">
                  Kembali ke Beranda
                </button>
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
