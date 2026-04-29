"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function MobileNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/#features", label: "Features" },
    { href: "/#technology", label: "Technology" },
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/#about", label: "About" },
  ];

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-60 p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="Toggle navigation menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-20 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-border shadow-xl"
          >
            <nav className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="font-heading text-base font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 px-4 py-3 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-border mt-3 pt-4 px-4">
                <Link
                  href={isLoggedIn ? "/dashboard" : "/auth/login"}
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-primary text-primary-foreground rounded-lg py-3 font-heading font-semibold text-sm shadow-lg shadow-primary/20"
                >
                  {isLoggedIn ? "Dashboard" : "Get Started"}
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
