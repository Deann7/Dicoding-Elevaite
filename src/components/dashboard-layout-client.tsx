"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  History,
  Settings,
  LogOut,
  Battery,
  FileSearch,
  Menu,
  X,
} from "lucide-react";
import { ResolutionAssistant } from "@/components/resolution-assistant";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

const SIDEBAR_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/ev-monitor", label: "Battery Monitor", icon: Battery },
  {
    href: "/dashboard/qa-scanner",
    label: "AI QA Scanner",
    icon: FileSearch,
    badge: "AI",
  },
  { href: "/dashboard/log", label: "System Logs", icon: History },
];

interface DashboardLayoutClientProps {
  children: ReactNode;
  displayName: string;
  initials: string;
  email: string;
}

export function DashboardLayoutClient({
  children,
  displayName,
  initials,
  email,
}: DashboardLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  /* Shared sidebar content used by both desktop and mobile */
  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-8 mb-8 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={40}
            height={48}
            className="brightness-0 invert"
          />
          <div>
            <h1 className="text-white font-heading font-bold uppercase tracking-widest text-sm">
              Volt-Guard
            </h1>
            <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">
              Vigilant Monitoring
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4">
        {SIDEBAR_LINKS.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`relative flex items-center gap-4 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="font-heading">{link.label}</span>
              {link.badge && (
                <span
                  className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-primary/20 text-primary"
                  }`}
                >
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="px-4">
        <Link
          href="/dashboard/settings"
          onClick={() => setMobileMenuOpen(false)}
          className={`relative flex items-center gap-4 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
            pathname === "/dashboard/settings"
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Settings className="h-5 w-5 shrink-0" />
          <span className="font-heading">Settings</span>
        </Link>
      </div>

      {/* User Info */}
      <div className="px-4 mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-2">
          <Avatar className="h-9 w-9 border-2 border-primary/20 rounded-full shrink-0">
            <AvatarFallback className="rounded-full bg-primary text-white font-heading text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold leading-none truncate">
              {displayName}
            </p>
            <p className="text-slate-500 text-[10px] font-data mt-1 truncate">
              {email}
            </p>
          </div>
        </div>
      </div>

      {/* Sign Out (mobile only) */}
      <div className="px-4 mt-2 md:hidden">
        <button
          onClick={handleSignOut}
          className="w-full py-3 bg-white/10 text-white/60 rounded-lg font-heading text-sm font-semibold flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      {/* New Scan Button */}
      <div className="px-4 mt-2">
        <Link href="/dashboard/qa-scanner" onClick={() => setMobileMenuOpen(false)}>
          <button className="w-full py-3 bg-primary text-white rounded-lg font-heading text-sm font-bold flex items-center justify-center gap-2 active:scale-95 duration-200 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
            <span className="text-lg leading-none">+</span>
            New Scan
          </button>
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#f8f9ff] text-slate-900 font-sans overflow-hidden">
      {/* ── DESKTOP SIDEBAR ──────────────────────────── */}
      <aside className="w-[260px] bg-[#1A1C1E] hidden md:flex flex-col py-8 gap-y-2 shadow-2xl shrink-0">
        {sidebarContent}
      </aside>

      {/* ── MOBILE SIDEBAR OVERLAY ───────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            {/* Sidebar */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-[#1A1C1E] z-50 md:hidden flex flex-col py-8 gap-y-2 shadow-2xl"
            >
              {/* Close button */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-6 right-4 text-white/40 hover:text-white p-1 z-10"
              >
                <X className="h-5 w-5" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ─────────────────────────────── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 h-14 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 flex justify-between items-center px-4 md:px-10 shrink-0">
          {/* Left: hamburger (mobile) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-1 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 text-slate-700" />
            </button>
            <span className="md:hidden font-heading font-bold text-base">VOLT-GUARD</span>
            <div className="hidden md:block" />
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-slate-900 leading-none">
                {displayName}
              </p>
            </div>

            {/* Sign Out (desktop) */}
            <button
              onClick={handleSignOut}
              className="hidden md:flex text-xs font-heading font-semibold text-slate-400 hover:text-slate-700 items-center gap-2 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-10 scroll-smooth">{children}</div>
      </main>

      {/* FLOATING ACTION ASSISTANT */}
      <ResolutionAssistant />
    </div>
  );
}
