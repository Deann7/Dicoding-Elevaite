import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // ── Gunakan serverClient yang membawa JWT user via cookie ──
    // auth.uid() akan terset otomatis → RLS bekerja dengan benar
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    // Validasi session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized — silakan login" }, { status: 401 });
    }

    const userId = user.id;
    console.log("[QA Release] Authenticated user:", userId);

    // Parse body
    const body = await req.json();
    const {
      pallet_code,
      document_name,
      avg_voltage,
      impedance,
      ai_confidence,
      passed_qa,
      fail_reason,
    } = body;

    if (!pallet_code) {
      return NextResponse.json({ error: "pallet_code required" }, { status: 400 });
    }

    const newStatus = passed_qa ? "OK" : "REJECT";

    // ── Cek apakah pallet sudah ada milik user ini ──────────────
    const { data: existing } = await supabase
      .from("pallets")
      .select("id, user_id")
      .eq("pallet_code", pallet_code)
      .maybeSingle();

    let palletId: string | null = null;

    if (existing) {
      // Pallet sudah ada — update statusnya
      console.log("[QA Release] Pallet ditemukan, update status →", newStatus);
      const { data: updated, error: updateErr } = await supabase
        .from("pallets")
        .update({
          status:       newStatus,
          alert_reason: fail_reason || null,
          last_updated: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select("id")
        .single();

      if (updateErr) {
        console.error("[QA Release] Update gagal:", updateErr.message);
        throw updateErr;
      }
      palletId = updated?.id ?? existing.id;
    } else {
      // Pallet belum ada — INSERT baru
      // serverClient otomatis bawa auth.uid() → RLS terpenuhi
      console.log("[QA Release] Pallet baru, insert pallet_code:", pallet_code);
      const { data: inserted, error: insertErr } = await supabase
        .from("pallets")
        .insert({
          pallet_code,
          status:       newStatus,
          vendor_name:  "CATL",       // FK ke tabel vendors — harus nilai yang valid
          temperature:  25.0,
          humidity:     50.0,
          cell_count:   48,
          location:     "QA Station",
          alert_reason: fail_reason || null,
          last_updated: new Date().toISOString(),
          user_id:      userId,
        })
        .select("id")
        .single();

      if (insertErr) {
        console.error("[QA Release] Insert gagal:", insertErr.message);
        throw insertErr;
      }
      palletId = inserted?.id ?? null;
    }

    // ── Insert QA inspection record ─────────────────────────────
    const { error: qaErr } = await supabase.from("qa_inspections").insert({
      pallet_code,
      document_name,
      avg_voltage,
      impedance,
      ai_confidence,
      passed_qa,
      fail_reason:  fail_reason || null,
      user_id:      userId,
    });

    if (qaErr) {
      console.warn("[QA Release] qa_inspections insert non-fatal:", qaErr.message);
    }

    console.log("[QA Release] Selesai ✓ pallet_id:", palletId);
    return NextResponse.json({ success: true, pallet_id: palletId });

  } catch (error: any) {
    console.error("[QA Release] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
