import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pallet_code, document_name, avg_voltage, impedance, ai_confidence, passed_qa, fail_reason } = body;

    if (!pallet_code) {
      return NextResponse.json({ error: "Pallet code required" }, { status: 400 });
    }

    // Panggil RPC release_pallet_from_qa di database
    const { data, error } = await supabase.rpc("release_pallet_from_qa", {
      p_pallet_code: pallet_code,
      p_document_name: document_name,
      p_avg_voltage: avg_voltage,
      p_impedance: impedance,
      p_ai_confidence: ai_confidence,
      p_passed_qa: passed_qa,
      p_fail_reason: fail_reason || null
    });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Supabase Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
