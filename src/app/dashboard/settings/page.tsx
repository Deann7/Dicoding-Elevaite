import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();

  let initialSettings = null;
  
  if (user) {
    const { data } = await supabase
      .from("system_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();
    
    initialSettings = data;
  }

  return (
    <SettingsClient initialSettings={initialSettings} />
  );
}
