import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Menu } from "lucide-react";
import Image from "next/image";

export async function Navbar() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-1 md:flex md:items-center md:gap-12">
            <Link
              href="/"
              className="block font-bold text-xl tracking-tight uppercase"
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

          <div className="md:flex md:items-center md:gap-12">
            <nav className="hidden md:block" aria-label="Global">
              <ul className="flex items-center gap-8 text-sm font-medium tracking-wide">
                <li>
                  <Link
                    className="text-foreground/80 transition hover:text-foreground"
                    href="/#features"
                  >
                    FEATURES
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-foreground/80 transition hover:text-foreground"
                    href="/#energy"
                  >
                    ENERGY
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-foreground/80 transition hover:text-foreground"
                    href="/#about"
                  >
                    ABOUT
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="flex items-center gap-4">
              <div className="sm:flex sm:gap-4">
                {user ? (
                  <Link
                    href="/dashboard"
                    className={buttonVariants({
                      variant: "default",
                      className:
                        "rounded-none font-bold uppercase tracking-widest text-xs px-6",
                    })}
                  >
                    DASHBOARD
                  </Link>
                ) : (
                  <Link
                    href="/auth/login"
                    className={buttonVariants({
                      variant: "default",
                      className:
                        "rounded-none font-bold uppercase tracking-widest text-xs px-6",
                    })}
                  >
                    LOGIN
                  </Link>
                )}
              </div>

              <div className="block md:hidden">
                <Button variant="ghost" size="icon" className="rounded-none">
                  <span className="sr-only">Toggle menu</span>
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
