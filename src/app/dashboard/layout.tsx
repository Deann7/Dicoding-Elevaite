import { ReactNode } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayoutClient } from "@/components/dashboard-layout-client";
import Head from "next/head";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Double-check: jika tidak ada session, redirect ke login
  // (middleware seharusnya sudah handle ini, ini adalah safety net)
  if (!user) {
    redirect("/auth/login?reason=unauthenticated");
  }

  // Ambil metadata user
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Operator";

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const email = user.email || "";

  return (
    <>
      <Head>
        <meta name="dicoding:email" content="deandronas@gmail.com" />
        <meta name="dicoding:email" content="putrikiaaara@gmail.com" />
        <meta name="dicoding:email" content="nelsonlaurensius1234@gmail.com" />
      </Head>
      <DashboardLayoutClient
        displayName={displayName}
        initials={initials}
        email={email}
      >
        {children}
      </DashboardLayoutClient>
    </>
  );
}
