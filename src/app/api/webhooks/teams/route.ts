import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Terima payload dari Supabase Webhook
    const payload = await req.json();
    const eventData = payload.record; // Data dari tabel pallet_events

    // Hanya kirim notif jika statusnya REJECT atau ON HOLD
    if (!["REJECT", "ON HOLD"].includes(eventData.new_status)) {
      return NextResponse.json({ message: "Ignored" });
    }

    // 2. Format pesan menggunakan Adaptive Cards (Standar MS Teams)
    const color = eventData.new_status === "REJECT" ? "FF0000" : "FFA500";
    const teamsPayload = {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      themeColor: color,
      summary: `Alert: Pallet ${eventData.pallet_code}`,
      sections: [
        {
          activityTitle: `🚨 Baterai ${eventData.pallet_code} mengalami masalah!`,
          activitySubtitle: `Status baru: **${eventData.new_status}**`,
          facts: [
            { name: "Pallet Code", value: eventData.pallet_code },
            { name: "Status", value: eventData.new_status },
            { name: "Trigger", value: eventData.trigger_source },
            {
              name: "Suhu Saat Kejadian",
              value: `${eventData.temperature_at_event}°C`,
            },
            { name: "Keterangan", value: eventData.note || "-" },
          ],
          markdown: true,
        },
      ],
    };

    // 3. Kirim ke Microsoft Teams
    const teamsUrl = process.env.MS_TEAMS_WEBHOOK_URL;
    if (!teamsUrl) throw new Error("Teams URL tidak diatur di .env");

    const res = await fetch(teamsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teamsPayload),
    });

    if (!res.ok) throw new Error("Gagal mengirim ke Teams");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Teams Webhook Error:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 },
    );
  }
}
