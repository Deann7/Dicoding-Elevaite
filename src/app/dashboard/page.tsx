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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Welcome back. Real-time EV battery telemetry and QA status.
          </p>
        </div>
        <div className="flex gap-3 max-md:flex-col">
          <QaTemplateButton />
          <Link href="/dashboard/ev-monitor" className="hidden sm:block">
            <Button
              variant="outline"
              className="rounded-none font-bold uppercase tracking-widest text-xs h-10 px-4 gap-2 border-black/20 hover:bg-black/5"
            >
              <Battery className="h-4 w-4" />
              Live Monitor
            </Button>
          </Link>
          <Link href="/dashboard/qa-scanner">
            <Button className="rounded-none font-bold uppercase tracking-widest text-xs h-10 px-6 gap-2 bg-black text-white hover:bg-black/80">
              <Plus className="h-4 w-4" />
              New QA Scan
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI STATS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Pallets */}
        <Card className="rounded-none border-black/20 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs uppercase tracking-widest font-bold">
              Total EV Pallets
            </CardTitle>
            <Package className="h-4 w-4 text-black/50" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">
              {totalPallets || 0}
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              Live from database
            </p>
          </CardContent>
        </Card>

        {/* Quarantine Status */}
        <Card className="rounded-none border-black/20 shadow-none relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pl-6">
            <CardTitle className="text-xs uppercase tracking-widest font-bold text-red-600">
              Quarantine / Reject
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent className="pl-6">
            <div className="text-3xl font-bold font-mono text-red-600">
              {quarantineCount || 0}
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              Needs inspection
            </p>
          </CardContent>
        </Card>

        {/* Pending QA */}
        <Card className="rounded-none border-black/20 shadow-none relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pl-6">
            <CardTitle className="text-xs uppercase tracking-widest font-bold text-blue-600">
              Pending QA
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="pl-6">
            <div className="text-3xl font-bold font-mono text-blue-600">
              {pendingQaCount || 0}
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              Awaiting auto-release
            </p>
          </CardContent>
        </Card>

        {/* System Integrity */}
        <Card className="rounded-none border-black/20 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs uppercase tracking-widest font-bold">
              Audit Trail
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="outline"
                className="rounded-none font-bold uppercase tracking-widest text-[10px] border-green-600 text-green-600 bg-green-50"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-3">
              Supabase Real-time
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* CENTER COLUMN / CRITICAL WATCHLIST */}
        <div className="md:col-span-4 lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold uppercase tracking-widest">
              Critical Battery Watchlist
            </h2>
            <Link
              href="/dashboard/ev-monitor"
              className="text-xs font-bold uppercase tracking-widest text-black/50 hover:text-black transition-colors"
            >
              View All
            </Link>
          </div>

          <Card className="rounded-none border-black/20 shadow-none">
            <CardContent className="p-0">
              <div className="divide-y divide-black/10">
                {!watchlist || watchlist.length === 0 ? (
                  <div className="p-8 text-center text-sm text-black/60 font-medium">
                    No critical issues detected. All batteries are optimal.
                  </div>
                ) : (
                  watchlist.map((pallet) => {
                    const isReject = pallet.status === "REJECT";
                    const isPending = pallet.status === "UNRELEASED";
                    const isHold = pallet.status === "ON HOLD";

                    const bgColor = isReject
                      ? "bg-red-50/50 hover:bg-red-50"
                      : isHold
                        ? "bg-yellow-50/50 hover:bg-yellow-50"
                        : "hover:bg-black/5";
                    const iconBg = isReject
                      ? "bg-red-100 text-red-600"
                      : isHold
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-blue-100 text-blue-600";
                    const Icon = isReject
                      ? Thermometer
                      : isHold
                        ? Activity
                        : Clock;
                    const badgeVariant = isReject ? "destructive" : "outline";
                    const badgeClass = isReject
                      ? "rounded-none text-[9px] uppercase tracking-widest"
                      : isHold
                        ? "rounded-none text-[9px] uppercase tracking-widest border-yellow-500 text-yellow-700 bg-yellow-100"
                        : "rounded-none text-[9px] uppercase tracking-widest border-blue-500 text-blue-700 bg-blue-50";

                    return (
                      <div
                        key={pallet.id}
                        className={`p-4 flex items-center justify-between transition-colors ${bgColor}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2 shrink-0 ${iconBg}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-base">
                                {pallet.pallet_code}
                              </span>
                              <Badge
                                variant={badgeVariant as any}
                                className={badgeClass}
                              >
                                {pallet.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-black/60 font-medium mt-1 max-w-sm line-clamp-1">
                              {pallet.alert_reason ||
                                (isPending
                                  ? "Awaiting document extraction."
                                  : "Pending inspection.")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-mono text-xl font-bold ${isReject ? "text-red-600" : isHold ? "text-yellow-600" : ""}`}
                          >
                            {pallet.temperature}°C
                          </div>
                          <div className="text-[10px] text-black/40 font-bold uppercase tracking-widest mt-1">
                            {pallet.location}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN / RECENT AI SCANS */}
        <div className="md:col-span-3 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold uppercase tracking-widest">
              Recent QA Scans
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-none h-8 w-8"
            >
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>

          <Card className="rounded-none border-black/20 shadow-none h-[350px] flex flex-col">
            <CardHeader className="pb-3 border-b border-black/10 shrink-0">
              <CardDescription className="text-xs uppercase tracking-widest font-bold">
                Automated Document Releases
              </CardDescription>
            </CardHeader>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {!recentScans || recentScans.length === 0 ? (
                  <div className="text-center text-xs text-black/50 py-4 font-medium uppercase tracking-widest">
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
                        className="flex flex-col gap-2 pb-4 border-b last:border-0 border-black/10"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex gap-2 items-center">
                            <FileText
                              className={`h-4 w-4 ${isRejected ? "text-red-600" : "text-black/60"}`}
                            />
                            <span
                              className={`text-sm font-bold font-mono ${isRejected ? "text-red-600" : ""}`}
                            >
                              {scan.document_name}
                            </span>
                          </div>
                          <Badge
                            variant={isRejected ? "destructive" : "outline"}
                            className={
                              isRejected
                                ? "rounded-none text-[10px] border-red-600 font-bold uppercase tracking-wider"
                                : isReleased
                                  ? "rounded-none text-[10px] bg-white text-black border-black/30 font-bold uppercase tracking-wider"
                                  : "rounded-none text-[10px] bg-black text-white border-black font-bold uppercase tracking-wider"
                            }
                          >
                            {statusLabel}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            Conf:{" "}
                            <span
                              className={`font-mono ${isRejected ? "text-red-600" : "text-black"}`}
                            >
                              {scan.ai_confidence || "0.00"}
                            </span>
                          </span>
                          <span>{formatRelativeTime(scan.created_at)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
}
