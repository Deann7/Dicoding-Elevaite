"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Mail, Eye, EyeOff, ArrowRight, Zap, Loader2, AlertTriangle, User, Building2, Factory } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const message = searchParams.get("message");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [industryType, setIndustryType] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Create business first
    const { data: businessId, error: businessError } = await supabase.rpc("create_business", {
      business_name: businessName,
      industry: industryType,
      tariff: 1500,
    });

    if (businessError || !businessId) {
      setError("Failed to create business. Please try again.");
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          business_id: businessId,
          role: "admin",
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    router.push("/auth/login?message=" + encodeURIComponent("Check your email to verify your account"));
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
                  Industrial-Grade Platform
                </span>
              </div>
              <h2 className="text-white font-heading text-4xl md:text-[42px] font-bold leading-tight">
                Join the Future of Manufacturing.
              </h2>
              <p className="text-white/40 text-base max-w-sm">
                Create your workspace to start managing battery inventories with AI-powered automation.
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
            Onboarding: Active
          </span>
        </div>
      </section>

      {/* ── RIGHT PANEL: Register Form ──────────────── */}
      <section className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center p-8 sm:p-12 md:p-16 lg:p-24 relative overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <Image src="/images/logo.png" alt="Logo" width={36} height={44} />
            <span className="font-heading text-xl font-bold tracking-tight">
              Volt-Guard
            </span>
          </div>

          {/* Form Header */}
          <header className="mb-8">
            <h1 className="text-slate-900 font-heading font-extrabold text-4xl mb-3">
              Create Account
            </h1>
            <p className="text-slate-500 text-base">
              Sign up to get started with your energy inventory system.
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

          {/* Register Form */}
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="block text-slate-700 font-heading font-semibold text-sm">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-[18px] w-[18px]" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 h-13 bg-slate-50 border-slate-200 border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900"
                  required
                />
              </div>
            </div>

            {/* Email */}
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
                  className="w-full pl-12 pr-4 py-4 h-13 bg-slate-50 border-slate-200 border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900"
                  required
                />
              </div>
            </div>

            {/* Company Name & Industry in a 2-col grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName" className="block text-slate-700 font-heading font-semibold text-sm">
                  Company Name
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-[18px] w-[18px]" />
                  <Input
                    id="businessName"
                    type="text"
                    placeholder="PT Sinergi"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 h-13 bg-slate-50 border-slate-200 border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="industryType" className="block text-slate-700 font-heading font-semibold text-sm">
                  Industry Type
                </Label>
                <div className="relative">
                  <Factory className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-[18px] w-[18px]" />
                  <Input
                    id="industryType"
                    type="text"
                    placeholder="Manufacturing"
                    value={industryType}
                    onChange={(e) => setIndustryType(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 h-13 bg-slate-50 border-slate-200 border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="block text-slate-700 font-heading font-semibold text-sm">
                Security Key
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-[18px] w-[18px]" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 h-13 bg-slate-50 border-slate-200 border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900"
                  required
                  minLength={6}
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
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <footer className="mt-10 text-center">
            <p className="text-slate-400 text-sm">
              Sudah punya akun?{" "}
              <Link
                href="/auth/login"
                className="text-primary font-bold hover:underline underline-offset-4"
              >
                Sign In
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
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
