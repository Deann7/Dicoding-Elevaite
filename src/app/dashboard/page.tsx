import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  XCircle,
  Calendar,
  TrendingUp,
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  // Fetch Settings for Business Name
  const { data: settings } = await supabase
    .from("system_settings")
    .select("business_name")
    .eq("user_id", userId!)
    .single();
  const businessName = settings?.business_name || "Elevaite Volt-Guard";

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
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-gradient-to-r from-blue-900 to-indigo-800 p-8 rounded-2xl text-white shadow-xl">
        <div className="space-y-2">
          <Badge className="bg-blue-400/20 text-blue-100 hover:bg-blue-400/30 border-none px-3 py-1 mb-2">
            EV Management Dashboard
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight">
            {businessName}
          </h1>
        </div>
        <div className="flex gap-3 max-md:flex-col">
          <div className="bg-white/10 rounded-xl p-1 backdrop-blur-md flex items-center gap-2">
            <QaTemplateButton />
            <Link href="/dashboard/ev-monitor" className="hidden sm:block">
              <Button
                variant="ghost"
                className="rounded-lg font-bold uppercase tracking-wider text-xs h-10 px-4 gap-2 text-white hover:bg-white/20 hover:text-white transition-all"
              >
                <Battery className="h-4 w-4" />
                Live Monitor
              </Button>
            </Link>
            <Link href="/dashboard/qa-scanner">
              <Button className="rounded-lg font-bold uppercase tracking-wider text-xs h-10 px-6 gap-2 bg-white text-blue-900 hover:bg-blue-50 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                <Plus className="h-4 w-4" />
                New QA Scan
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI STATS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Pallets */}
        <Card className="rounded-2xl border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs uppercase tracking-widest font-bold text-slate-500">
              Total EV Pallets
            </CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-slate-900">
              {totalPallets || 0}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Live from inventory
            </p>
          </CardContent>
        </Card>

        {/* Quarantine Status */}
        <Card className="rounded-2xl border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pl-6">
            <CardTitle className="text-xs uppercase tracking-widest font-bold text-red-600">
              Quarantine / Reject
            </CardTitle>
            <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="pl-6">
            <div className="text-4xl font-extrabold text-red-600">
              {quarantineCount || 0}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Needs inspection
            </p>
          </CardContent>
        </Card>

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
                      <tr
                        key={pallet.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
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
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusColor}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${isReject ? "bg-red-500" : isHold ? "bg-yellow-500" : "bg-slate-400"}`}
                            />
                            {pallet.status}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-data text-lg font-medium ${tempColor}`}
                            >
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
