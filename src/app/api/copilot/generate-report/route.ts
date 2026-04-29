import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { AzureOpenAI } from "openai";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const body = await req.json();
    const { pallet_id } = body;

    if (!pallet_id) {
      return NextResponse.json(
        { error: "pallet_id is required" },
        { status: 400 },
      );
    }

    // Fetch pallet data from Supabase
    const { data: pallet, error } = await supabase
      .from("pallets")
      .select("*")
      .eq("id", pallet_id)
      .single();

    if (error || !pallet) {
      return NextResponse.json({ error: "Pallet not found" }, { status: 404 });
    }

    // Use Azure OpenAI if API keys are available, otherwise use rule-based fallback
    const azureEndpoint = process.env.AZURE_COPILOT_ENDPOINT;
    const azureApiKey = process.env.AZURE_COPILOT_INTELLIGENCE_KEY;
    const deploymentName =
      process.env.AZURE_COPILOT_DEPLOYMENT || "gpt-4.1-mini-2";
    const apiVersion = "2025-01-01-preview";

    if (azureEndpoint && azureApiKey) {
      // ── Verbose Connection Info ──────────────────────────────────────
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🔵 [Azure AI] Initiating request...");
      console.log("🔹 Endpoint   :", azureEndpoint);
      console.log("🔹 Deployment :", deploymentName);
      console.log("🔹 API Version:", apiVersion);
      console.log("🔹 Api Key    :", azureApiKey);
      console.log("🔹 Pallet     :", pallet.pallet_code);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      try {
        console.log(azureApiKey);
        const client = new AzureOpenAI({
          endpoint: azureEndpoint,
          apiKey: azureApiKey,
          deployment: deploymentName,
          apiVersion,
        });

        console.log("🔵 [Azure AI] Sending chat completion request...");

        const aiResponse = await client.chat.completions.create({
          model: deploymentName,
          messages: [
            {
              role: "system",
              content:
                "You are a manufacturing quality analyst generating professional incident reports for an EV battery storage facility. Provide structured, data-driven analysis with clear action items.",
            },
            {
              role: "user",
              content: `Please generate a professional incident report for the following battery storage anomaly:\n\nPallet ID: ${pallet.pallet_code}\nStorage Location: ${pallet.location}\nSupplier: ${pallet.vendor_name || pallet.vendor}\nUnit Count: ${pallet.cell_count}\nRecorded Temperature: ${pallet.temperature}°C\nHumidity Level: ${pallet.humidity ?? "N/A"}%\nCurrent Status: ${pallet.status}\nAlert Description: ${pallet.alert_reason}\nRecorded At: ${pallet.last_updated}\n\nStructure the report with these sections:\n1. Incident Summary\n2. Risk Assessment\n3. Immediate Actions Required\n4. Recommended Next Steps`,
            },
          ],
          max_tokens: 800,
        });

        if ((aiResponse as any)?.error !== undefined) {
          throw (aiResponse as any).error;
        }

        const report = aiResponse.choices[0]?.message?.content;
        if (report) {
          console.log("✅ [Azure AI] Report generated successfully.");
          console.log(
            "🔹 Tokens used:",
            aiResponse.usage?.total_tokens ?? "N/A",
          );
          return NextResponse.json({ report, pallet });
        }

        throw new Error(
          "Empty response from AI — choices array was empty or content was null.",
        );
      } catch (aiErr: any) {
        // ── Verbose Error Logging ────────────────────────────────────
        const errStatus = aiErr?.status ?? aiErr?.statusCode ?? "N/A";
        const errCode = aiErr?.code ?? aiErr?.error?.code ?? "N/A";
        const errType = aiErr?.name ?? aiErr?.type ?? "UnknownError";
        const errMsg = aiErr?.message ?? "(no message)";
        const errReqId =
          aiErr?.request_id ?? aiErr?.headers?.["x-request-id"] ?? "N/A";
        const errBody = aiErr?.error
          ? JSON.stringify(aiErr.error, null, 2)
          : "(no structured body)";

        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.error("⚠️  AZURE OPENAI — VERBOSE ERROR LOG");
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.error("🔹 Message     :", errMsg);
        console.error("🔹 Error Type  :", errType);
        console.error("🔹 HTTP Status :", errStatus);
        console.error("🔹 Error Code  :", errCode);
        console.error("🔹 Request ID  :", errReqId);
        console.error("🔹 Deployment  :", deploymentName);
        console.error("🔹 API Version :", apiVersion);
        console.error("🔹 Endpoint    :", azureEndpoint);
        console.error("🔹 Azure Body  :", errBody);

        // Log response headers if present
        if (aiErr?.headers) {
          try {
            const headers =
              typeof aiErr.headers.entries === "function"
                ? Object.fromEntries(aiErr.headers.entries())
                : aiErr.headers;
            console.error("🔹 Resp Headers:", JSON.stringify(headers, null, 2));
          } catch {
            console.error("🔹 Resp Headers: (could not serialize)");
          }
        }

        console.error("🔹 Full Stack  :", aiErr?.stack ?? "(no stack trace)");
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.warn("⚠️  Falling back to rule-based report generation.");

        // Return fallback report with full error detail for the client/frontend
        const fallbackReport = generateRuleBasedReport(pallet);
        return NextResponse.json({
          report: fallbackReport,
          pallet,
          ai_fallback: true,
          ai_error: {
            message: errMsg,
            type: errType,
            status: errStatus,
            code: errCode,
            request_id: errReqId,
            deployment: deploymentName,
            api_version: apiVersion,
            endpoint: azureEndpoint,
            body: aiErr?.error ?? null,
          },
        });
      }
    }

    // No keys configured — silent fallback
    console.warn("⚠️  Azure AI env vars not set. Using rule-based fallback.");
    const report = generateRuleBasedReport(pallet);
    return NextResponse.json({ report, pallet, ai_fallback: true });
  } catch (err: any) {
    console.error("❌ Copilot Route Error:", err?.message || err);
    return NextResponse.json(
      { error: "Internal server error", detail: err?.message },
      { status: 500 },
    );
  }
}

function generateRuleBasedReport(pallet: Record<string, unknown>) {
  const temp = pallet.temperature as number;
  const riskLevel = temp >= 42 ? "CRITICAL" : temp >= 35 ? "HIGH" : "MEDIUM";
  const timestamp = new Date(pallet.last_updated as string).toLocaleString(
    "id-ID",
    { timeZone: "Asia/Jakarta" },
  );

  return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ELEVAITE VOLT-GUARD — INCIDENT REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ref: INC-${Date.now().toString().slice(-6)}
Timestamp: ${timestamp} WIB
Generated by: AI Safety Copilot v1.0

[1] INCIDENT SUMMARY
Pallet ${pallet.pallet_code} at ${pallet.location} (Vendor: ${pallet.vendor}) has been flagged with status ${pallet.status}. Recorded temperature: ${temp}°C — exceeds safe storage threshold. ${pallet.alert_reason}

[2] RISK ASSESSMENT
Severity: ${riskLevel}
${temp >= 42 ? `⚠️ THERMAL RUNAWAY risk detected. High probability of electrolyte ignition if not addressed immediately. This pallet contains ${pallet.cell_count} lithium cells.` : "📊 Elevated temperature requires monitoring. No immediate thermal runaway risk, but continued exposure may degrade battery capacity and lifespan."}

[3] IMMEDIATE ACTIONS REQUIRED
• ✅ Auto-quarantine zone isolation: ACTIVATED
• 🚫 Block pallet from entering production line
• 🌡️ Deploy mobile cooling unit to zone immediately
• 📋 Notify QA Supervisor and Warehouse Manager

[4] RECOMMENDED NEXT STEPS
• Dispatch thermal camera inspection within 30 mins
• Contact vendor ${pallet.vendor} for batch recall inquiry
• Log incident to Traceability System (ITS)
• Schedule full batch inspection for all pallets from same vendor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}
