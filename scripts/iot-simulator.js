#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════╗
 * ║   ELEVAITE VOLT-GUARD — IoT Sensor Simulator    ║
 * ║   Triggers thermal anomaly on a target pallet   ║
 * ╚══════════════════════════════════════════════════╝
 *
 * Usage:
 *   node scripts/iot-simulator.js [pallet_code] [temperature]
 *
 * Examples:
 *   node scripts/iot-simulator.js B-102          # → triggers REJECT (48°C)
 *   node scripts/iot-simulator.js B-105 38       # → triggers ON HOLD (38°C)
 *   node scripts/iot-simulator.js B-101 22       # → resets back to OK (22°C)
 */

const BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

const palletCode = process.argv[2] || "B-102";
const customTemp = process.argv[3] ? parseFloat(process.argv[3]) : null;

// If no temperature provided, default to a CRITICAL thermal runaway scenario
const temperature = customTemp ?? 48;
const humidity = Math.floor(Math.random() * 20) + 60; // 60-80% humidity spike

async function triggerAnomaly() {
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║   ELEVAITE VOLT-GUARD — IoT Simulator           ║");
  console.log("╚══════════════════════════════════════════════════╝\n");
  console.log(`📡 Targeting Pallet:  ${palletCode}`);
  console.log(`🌡️  Injecting Temp:   ${temperature}°C`);
  console.log(`💧 Humidity:          ${humidity}%`);
  console.log(`🔗 API Endpoint:      ${BASE_URL}/api/iot/update`);

  if (temperature >= 42) {
    console.log("\n⚡ SIMULATING: CRITICAL Thermal Runaway Risk!");
  } else if (temperature >= 35) {
    console.log("\n⚠️  SIMULATING: ON HOLD — Temperature Warning");
  } else {
    console.log("\n✅ SIMULATING: Normal operation — Status reset to OK");
  }

  console.log("\n🚀 Sending data to API...\n");

  try {
    const response = await fetch(`${BASE_URL}/api/iot/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pallet_code: palletCode, temperature, humidity }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ API Error:", data.error);
      process.exit(1);
    }

    console.log("✅ API Response:", JSON.stringify(data, null, 2));
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`   Status changed to: [${data.status}]`);
    console.log("   Check the dashboard → dashboard/ev-monitor");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (err) {
    console.error("❌ Failed to reach API:", err.message);
    console.log("\nMake sure your Next.js dev server is running: pnpm dev\n");
    process.exit(1);
  }
}

triggerAnomaly();
