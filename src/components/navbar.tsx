import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Image from "next/image";
import { MobileNav } from "@/components/mobile-nav";

export async function Navbar() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="fixed top-0 z-50 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-border/40 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="Elevaite Volt-Guard"
                width={48}
                height={48}
                className="w-12 h-12"
              />
              <span className="hidden sm:block font-heading font-bold text-lg tracking-tight text-foreground">
                Volt-Guard
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            <Link
              className="font-heading text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
              href="/#features"
            >
              Features
            </Link>
            <Link
              className="font-heading text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
              href="/#technology"
            >
              Technology
            </Link>
            <Link
              className="font-heading text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
              href="/#how-it-works"
            >
              How It Works
            </Link>
            <Link
              className="font-heading text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
              href="/#about"
            >
              About
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className={buttonVariants({
                  variant: "default",
                  className:
                    "hidden md:inline-flex bg-primary hover:bg-primary-container text-primary-foreground rounded-lg font-heading text-sm font-semibold px-6 py-2.5 shadow-lg shadow-primary/20 transition-all",
                })}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className={buttonVariants({
                  variant: "default",
                  className:
                    "hidden md:inline-flex bg-primary hover:bg-primary-container text-primary-foreground rounded-lg font-heading text-sm font-semibold px-6 py-2.5 shadow-lg shadow-primary/20 transition-all",
                })}
              >
                Get Started
              </Link>
            )}

            {/* Mobile Menu Button */}
            <MobileNav isLoggedIn={!!user} />
          </div>
        </div>
      </div>
    </header>
  );
}
