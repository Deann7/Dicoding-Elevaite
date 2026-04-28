"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function login(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/auth/login?message=" + encodeURIComponent(error.message));
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const businessName = formData.get("businessName") as string;
  const industryType = formData.get("industryType") as string;

  // We need to register a business first because of the DB constraints.
  // Because 'businesses' restricts inserts to authenticated or service roles,
  // we will try using an RPC function if we create it, OR we can fail gracefully 
  // and request the user to allow inserts or use a default business id.
  
  // NOTE: For now, we will create the auth user. BUT the trigger 'handle_new_user' 
  // will FAIL if business_id is not passed. 
  
  // To solve this properly, you must execute the SQL RPC `create_business` 
  // provided in the setup instructions (I'll share this with you).
  // Once the RPC exists, we do:
  
  const { data: businessId, error: businessError } = await supabase.rpc('create_business', {
    business_name: businessName,
    industry: industryType,
    tariff: 1500 // default PLN tariff example
  });

  if (businessError || !businessId) {
    redirect("/auth/register?message=" + encodeURIComponent("Failed to create business. Please run the SQL RPC."));
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        business_id: businessId,
        role: "admin", // first user of business is admin
      },
    },
  });

  if (error) {
    redirect("/auth/register?message=" + encodeURIComponent(error.message));
  }

  revalidatePath("/", "layout");
  redirect("/auth/login?message=" + encodeURIComponent("Check your email to verify your account"));
}

export async function logout() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth/login");
}
