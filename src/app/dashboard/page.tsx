import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QaTemplateButton } from "@/components/ev-monitor/qa-template-button";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Plus,
  ShieldCheck,
  Package,
  Thermometer,
  Clock,
  Battery,
  Calendar,
  Download,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} secs ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hrs ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
}

export default async function DashboardOverview() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get current user untuk multi-tenant filtering
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  // Fetch KPIs — hanya data milik user ini
  const { count: totalPallets } = await supabase
    .from("pallets")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId!);

  const { count: quarantineCount } = await supabase
    .from("pallets")
    .select("*", { count: "exact", head: true })
    .in("status", ["ON HOLD", "REJECT"])
    .eq("user_id", userId!);

  const { count: pendingQaCount } = await supabase
    .from("pallets")
    .select("*", { count: "exact", head: true })
    .eq("status", "UNRELEASED")
    .eq("user_id", userId!);

  // Fetch Watchlist — hanya data milik user ini
  const { data: watchlist } = await supabase
    .from("pallets")
    .select("*")
    .neq("status", "OK")
    .eq("user_id", userId!)
    .order("temperature", { ascending: false })
    .limit(5);

  // Fetch Recent Scans — hanya data milik user ini
  const { data: recentScans } = await supabase
    .from("qa_inspections")
    .select("*")
    .eq("user_id", userId!)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* ── HEADER SECTION ──────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            Real-time status of the EV Battery pallet ecosystem.
          </p>
        </div>
        <div className="flex gap-3 max-md:flex-col">
          <QaTemplateButton />
          <Link href="/dashboard/ev-monitor" className="hidden sm:block">
            <Button
              variant="outline"
              className="rounded-xl font-heading text-sm font-semibold h-11 px-5 gap-2 border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              Last 24 Hours
            </Button>
          </Link>
          <Link href="/dashboard/qa-scanner">
            <Button className="rounded-xl font-heading text-sm font-semibold h-11 px-6 gap-2 bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-[0.97] transition-all">
              <Plus className="h-4 w-4" />
              New QA Scan
            </Button>
          </Link>
        </div>
      </div>

      {/* ── BENTO KPI GRID ──────────────────────────── */}
      <div className="grid grid-cols-12 gap-5">
        {/* Total EV Pallets */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-4 bg-white p-6 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="font-data text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Total EV Pallets
              </span>
              <span className="p-2 bg-primary/10 text-primary rounded-lg">
                <Package className="h-5 w-5" />
              </span>
            </div>
            <h3 className="font-data text-4xl font-medium text-slate-900">
              {totalPallets || 0}
            </h3>
          </div>
          <div className="mt-4 flex items-center gap-2 text-green-600 text-sm font-semibold">
            <TrendingUp className="h-4 w-4" />
            <span>Live from database</span>
          </div>
        </div>

        {/* Reject / Quarantine */}
        <div className="col-span-6 sm:col-span-3 lg:col-span-2 bg-white p-6 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="font-data text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Reject
              </span>
              <span className="p-2 bg-red-50 text-red-600 rounded-lg">
                <AlertTriangle className="h-5 w-5" />
              </span>
            </div>
            <h3 className="font-data text-4xl font-medium text-slate-900">
              {quarantineCount || 0}
            </h3>
          </div>
          <div className="mt-4">
            {(quarantineCount || 0) > 0 ? (
              <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Urgent
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-medium">All clear</span>
            )}
          </div>
        </div>

        {/* Pending QA */}
        <div className="col-span-6 sm:col-span-3 lg:col-span-2 bg-white p-6 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="font-data text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Pending QA
              </span>
              <span className="p-2 bg-primary/10 text-primary rounded-lg">
                <Clock className="h-5 w-5" />
              </span>
            </div>
            <h3 className="font-data text-4xl font-medium text-slate-900">
              {pendingQaCount || 0}
            </h3>
          </div>
          <div className="mt-4 text-slate-400 text-xs font-medium">
            Awaiting scanner
          </div>
        </div>

        {/* Audit Trail */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-4 bg-white p-6 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between bg-gradient-to-br from-white to-slate-50/50">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="font-data text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Audit Trail Status
              </span>
              <span className="p-2 bg-green-50 text-green-600 rounded-lg">
                <ShieldCheck className="h-5 w-5" />
              </span>
            </div>
            <div className="flex items-center gap-3">
              <h3 className="font-heading text-2xl font-bold text-slate-900">
                Compliant
              </h3>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-slate-500 text-xs italic">
            Supabase Real-time connected
          </p>
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ──────────────────────── */}
      <div className="grid grid-cols-12 gap-5">
        {/* Critical Battery Watchlist */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary" />
              <h4 className="font-heading text-lg font-bold text-slate-900">
                Critical Battery Watchlist
              </h4>
            </div>
            <Link
              href="/dashboard/ev-monitor"
              className="text-primary font-heading text-sm font-semibold hover:underline"
            >
              View All Units
            </Link>
          </div>
          <div className="overflow-x-auto">
            {!watchlist || watchlist.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-medium">
                  No critical issues detected. All batteries are optimal.
                </p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-6 py-4 font-data text-xs font-semibold text-slate-400 uppercase tracking-widest">
                      Unit ID
                    </th>
                    <th className="px-6 py-4 font-data text-xs font-semibold text-slate-400 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-6 py-4 font-data text-xs font-semibold text-slate-400 uppercase tracking-widest">
                      Internal Temp
                    </th>
                    <th className="px-6 py-4 font-data text-xs font-semibold text-slate-400 uppercase tracking-widest">
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {watchlist.map((pallet) => {
                    const isReject = pallet.status === "REJECT";
                    const isHold = pallet.status === "ON HOLD";
                    const tempColor = isReject
                      ? "text-red-600"
                      : isHold
                        ? "text-yellow-600"
                        : "text-slate-900";

                    const statusColor = isReject
                      ? "bg-red-50 text-red-700 border-red-100"
                      : isHold
                        ? "bg-yellow-50 text-yellow-700 border-yellow-100"
                        : "bg-slate-100 text-slate-600 border-slate-200";

                    return (
                      <tr key={pallet.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                              <Battery className="h-4 w-4 text-slate-500" />
                            </div>
                            <span className="font-bold text-slate-900">
                              {pallet.pallet_code}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusColor}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isReject ? "bg-red-500" : isHold ? "bg-yellow-500" : "bg-slate-400"}`} />
                            {pallet.status}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <span className={`font-data text-lg font-medium ${tempColor}`}>
                              {pallet.temperature}°C
                            </span>
                            <Thermometer className={`h-4 w-4 ${tempColor}`} />
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm text-slate-500 font-medium">
                            {pallet.location || "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent QA Scans */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <h4 className="font-heading text-lg font-bold text-slate-900">
                Recent QA Scans
              </h4>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-5 space-y-3">
              {!recentScans || recentScans.length === 0 ? (
                <div className="text-center text-sm text-slate-400 py-8 font-medium">
                  No scans available
                </div>
              ) : (
                recentScans.map((scan) => {
                  const isRejected = !scan.passed_qa;
                  const statusLabel = scan.passed_qa
                    ? "Released"
                    : scan.fail_reason
                      ? "Rejected"
                      : "Pending";
                  const isReleased = statusLabel === "Released";

                  return (
                    <div
                      key={scan.id}
                      className="group flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          isRejected
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {isRejected ? (
                          <XCircle className="h-5 w-5" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-slate-900 text-sm truncate">
                            {scan.document_name}
                          </p>
                          <span className="text-[10px] font-data text-slate-400 ml-2 shrink-0">
                            {formatRelativeTime(scan.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          Conf: {scan.ai_confidence || "0.00"}
                        </p>
                        <div className="mt-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                              isRejected
                                ? "bg-red-50 text-red-600"
                                : "bg-green-50 text-green-600"
                            }`}
                          >
                            {statusLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t border-slate-100">
            <Link href="/dashboard/log">
              <button className="w-full py-2.5 bg-slate-50 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors">
                Full Scan History
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
