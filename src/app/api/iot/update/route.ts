import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TEMP_WARN_THRESHOLD = 35;  // °C
const TEMP_DANGER_THRESHOLD = 42; // °C - Thermal Runaway risk

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pallet_code, temperature, humidity } = body;

    if (!pallet_code || temperature === undefined) {
      return NextResponse.json(
        { error: "pallet_code and temperature are required" },
        { status: 400 }
      );
    }

    // Determine status based on temperature thresholds
    let status: "OK" | "ON HOLD" | "REJECT" = "OK";
    let alert_reason: string | null = null;

    if (temperature >= TEMP_DANGER_THRESHOLD) {
      status = "REJECT";
      alert_reason = `CRITICAL: Thermal Runaway Risk — Temperature ${temperature}°C exceeds safe limit of ${TEMP_DANGER_THRESHOLD}°C. Auto-quarantine triggered.`;
    } else if (temperature >= TEMP_WARN_THRESHOLD) {
      status = "ON HOLD";
      alert_reason = `WARNING: Temperature ${temperature}°C above safe range (${TEMP_WARN_THRESHOLD}°C). Pending inspection.`;
    }

    const { data, error } = await supabase
      .from("pallets")
      .update({
        temperature,
        humidity: humidity ?? null,
        status,
        alert_reason,
        last_updated: new Date().toISOString(),
      })
      .eq("pallet_code", pallet_code)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, pallet: data, status }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({ status: "IoT endpoint active", timestamp: new Date().toISOString() });
}
