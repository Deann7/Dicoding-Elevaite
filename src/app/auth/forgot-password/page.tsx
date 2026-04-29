"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowRight, Zap, Loader2, Shield, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/login`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
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
                  Account Recovery
                </span>
              </div>
              <h2 className="text-white font-heading text-4xl md:text-[42px] font-bold leading-tight">
                Secure Access Recovery.
              </h2>
              <p className="text-white/40 text-base max-w-sm">
                We&apos;ll send you a secure link to regain access to your monitoring dashboard.
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
            Recovery Mode
          </span>
        </div>
      </section>

      {/* ── RIGHT PANEL: Forgot Password Form ────────── */}
      <section className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center p-8 sm:p-12 md:p-24 relative">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="lg:hidden mb-12 flex items-center gap-2">
            <Image src="/images/logo.png" alt="Logo" width={36} height={44} />
            <span className="font-heading text-xl font-bold tracking-tight">
              Volt-Guard
            </span>
          </div>

          {/* Back link */}
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 text-sm font-heading font-medium transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>

          {sent ? (
            /* ── Success State ──────────────────────── */
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-slate-900 font-heading font-extrabold text-3xl mb-3">
                  Email Terkirim!
                </h1>
                <p className="text-slate-500 text-base leading-relaxed">
                  Kami telah mengirimkan link reset password ke{" "}
                  <span className="font-semibold text-slate-700">{email}</span>.
                  Periksa inbox Anda.
                </p>
              </div>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white font-heading font-bold py-3 px-8 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
              >
                Kembali ke Login
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            /* ── Form State ─────────────────────────── */
            <>
              <header className="mb-10">
                <h1 className="text-slate-900 font-heading font-extrabold text-4xl mb-3">
                  Reset Password
                </h1>
                <p className="text-slate-500 text-base">
                  Enter your email and we&apos;ll send you a link to reset your password.
                </p>
              </header>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                  <Shield className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-6">
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-[#4c2fc0] text-white font-heading font-bold py-4 rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>

              <footer className="mt-16 text-center">
                <p className="text-slate-400 text-sm">
                  Remember your password?{" "}
                  <Link
                    href="/auth/login"
                    className="text-primary font-bold hover:underline underline-offset-4"
                  >
                    Sign In
                  </Link>
                </p>
              </footer>
            </>
          )}

          {/* Security notice */}
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-300 font-data uppercase tracking-widest mt-8">
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
    </div>
  );
}
