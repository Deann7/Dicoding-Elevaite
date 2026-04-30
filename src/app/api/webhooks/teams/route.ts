import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Terima payload
    const payload = await req.json();
    const eventData = payload.record;

    console.log("[Teams Webhook] Payload diterima:", JSON.stringify(eventData));

    if (!eventData) {
      return NextResponse.json({ error: "Payload tidak valid, field 'record' tidak ditemukan" }, { status: 400 });
    }

    // Hanya kirim notif jika statusnya REJECT atau ON HOLD
    if (!["REJECT", "ON HOLD"].includes(eventData.new_status)) {
      console.log("[Teams Webhook] Status ignored:", eventData.new_status);
      return NextResponse.json({ message: "Ignored", status: eventData.new_status });
    }

    const teamsUrl = process.env.MS_TEAMS_WEBHOOK_URL;
    if (!teamsUrl) {
      console.error("[Teams Webhook] MS_TEAMS_WEBHOOK_URL belum diatur di .env");
      return NextResponse.json({ error: "MS_TEAMS_WEBHOOK_URL tidak diatur di .env" }, { status: 500 });
    }

    // 2. Format pesan — mendukung baik Teams Incoming Webhook maupun Power Automate HTTP trigger
    const color = eventData.new_status === "REJECT" ? "FF0000" : "FFA500";
    const teamsPayload = {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      themeColor: color,
      summary: `⚡ Alert: Pallet ${eventData.pallet_code} — ${eventData.new_status}`,
      sections: [
        {
          activityTitle: `🚨 Baterai ${eventData.pallet_code} mengalami masalah!`,
          activitySubtitle: `Status baru: **${eventData.new_status}**`,
          facts: [
            { name: "Pallet Code", value: eventData.pallet_code || "-" },
            { name: "Status", value: eventData.new_status },
            { name: "Trigger", value: eventData.trigger_source || "MANUAL" },
            {
              name: "Suhu Saat Kejadian",
              value: eventData.temperature_at_event != null
                ? `${eventData.temperature_at_event}°C`
                : "N/A",
            },
            { name: "Keterangan", value: eventData.note || "-" },
          ],
          markdown: true,
        },
      ],
    };

    console.log("[Teams Webhook] Mengirim ke URL:", teamsUrl.substring(0, 60) + "...");
    console.log("[Teams Webhook] Payload:", JSON.stringify(teamsPayload));

    // 3. Kirim ke Teams / Power Automate
    // NOTE: Power Automate HTTP trigger kadang mengembalikan 202 Accepted, bukan 200 OK.
    // Kita terima semua 2xx sebagai sukses.
    const res = await fetch(teamsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teamsPayload),
    });

    const responseText = await res.text();
    console.log("[Teams Webhook] Response status:", res.status, "| Body:", responseText);

    // Power Automate bisa return 200/202 — keduanya dianggap sukses
    if (res.status >= 200 && res.status < 300) {
      return NextResponse.json({ success: true, teamsStatus: res.status, teamsResponse: responseText });
    }

    // Jika status di luar 2xx, tetap log tapi tidak crash
    console.warn("[Teams Webhook] Teams mengembalikan status non-2xx:", res.status, responseText);
    return NextResponse.json(
      { success: false, teamsStatus: res.status, teamsResponse: responseText },
      { status: 502 },
    );

  } catch (error: any) {
    console.error("[Teams Webhook] Error kritis:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Failed to send notification" },
      { status: 500 },
    );
  }
}
