"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  History,
  Settings,
  LogOut,
  Search,
  Battery,
  FileSearch,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ResolutionAssistant } from "@/components/resolution-assistant";
import Image from "next/image";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

const SIDEBAR_LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/ev-monitor", label: "EV Battery Monitor", icon: Battery },
  {
    href: "/dashboard/qa-scanner",
    label: "QA Auto-Release",
    icon: FileSearch,
    badge: "AI",
  },
  { href: "/dashboard/log", label: "Audit Logs", icon: History },
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <div className="flex h-screen bg-white text-black font-sans overflow-hidden selection:bg-black selection:text-white">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-black/10 flex flex-col justify-between hidden md:flex shrink-0 relative">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-black/10">
            <Link
              href="/"
              className="font-bold text-xl uppercase tracking-widest flex items-center gap-2"
            >
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={80}
                height={100}
                className="py-4"
              />
            </Link>
          </div>

          <div className="p-4">
            <div className="relative mb-6">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-black/50" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full pl-9 rounded-none border border-black/20 focus-visible:ring-1 focus-visible:ring-black/50 h-9"
              />
            </div>

            <nav className="space-y-1 relative">
              {SIDEBAR_LINKS.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors group z-10 ${
                      isActive ? "text-white" : "text-black/70 hover:text-black"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-nav"
                        className="absolute inset-0 bg-black z-[-1]"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                    {!isActive && (
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity z-[-1]" />
                    )}
                    <Icon className="h-4 w-4 shrink-0" />
                    {link.label}
                    {link.badge && (
                      <span
                        className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-widest ${
                          isActive
                            ? "bg-white text-black"
                            : "bg-black text-white"
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-black/10">
          <nav className="space-y-1 mb-4">
            <Link
              href="/dashboard/settings"
              className={`relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors group z-10 ${
                pathname === "/dashboard/settings"
                  ? "text-white"
                  : "text-black/70 hover:text-black"
              }`}
            >
              {pathname === "/dashboard/settings" && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 bg-black z-[-1]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              {pathname !== "/dashboard/settings" && (
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity z-[-1]" />
              )}
              <Settings className="h-4 w-4 shrink-0" />
              Settings
            </Link>
          </nav>

          {/* User Info — Dynamic */}
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="h-9 w-9 border border-black/20 rounded-none bg-black text-white">
              <AvatarFallback className="rounded-none bg-black text-white font-mono text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold leading-none truncate">
                {displayName}
              </span>
              <span className="text-xs text-black/50 font-mono mt-1 truncate">
                {email}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#fafafa]">
        {/* Top Navigation */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-black/10 bg-white shrink-0">
          <div className="md:hidden font-bold">VOLT-GUARD</div>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <button
              onClick={handleSignOut}
              className="hidden md:flex text-xs font-semibold uppercase tracking-widest text-black/50 hover:text-black items-center gap-2 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-8">{children}</div>
      </main>

      {/* FLOATING ACTION ASSISTANT */}
      <ResolutionAssistant />
    </div>
  );
}
