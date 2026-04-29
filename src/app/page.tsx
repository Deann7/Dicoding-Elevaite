import { Navbar } from "@/components/navbar";
import { LandingContent } from "@/components/landing/landing-content";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Navbar />
      <LandingContent isLoggedIn={!!user} />
    </>
  );
}
