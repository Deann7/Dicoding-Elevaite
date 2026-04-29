"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function updateBusinessProfile(formData: FormData) {
  const businessName = formData.get("businessName") as string;
  const industrySegment = formData.get("industrySegment") as string;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("system_settings")
    .update({ business_name: businessName, industry_segment: industrySegment })
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating settings", error);
    return { error: "Failed to update settings." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function purgeQAScans() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("qa_inspections")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    console.error("Error purging QA scans", error);
    return { error: "Failed to purge QA scans." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function factoryReset() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  try {
    // Wipe all related user data
    const { error: err1 } = await supabase.from("qa_inspections").delete().eq("user_id", user.id);
    if (err1) throw err1;

    const { error: err2 } = await supabase.from("pallet_events").delete().eq("user_id", user.id);
    if (err2) throw err2;

    const { error: err3 } = await supabase.from("pallets").delete().eq("user_id", user.id);
    if (err3) throw err3;

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error: any) {
    console.error("Error factory reset", error);
    return { error: "Failed to factory reset." };
  }
}
