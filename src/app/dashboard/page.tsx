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
  Battery
} from "lucide-react";

export default function DashboardOverview() {
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
        <div className="flex gap-3">
          <Link href="/dashboard/ev-monitor">
            <Button variant="outline" className="rounded-none font-bold uppercase tracking-widest text-xs h-10 px-4 gap-2 border-black/20 hover:bg-black/5">
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
            <div className="text-3xl font-bold font-mono">1,420</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              <span className="text-black font-semibold">+12%</span> from last month
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
            <div className="text-3xl font-bold font-mono text-red-600">8</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              Thermal runaway risk detected
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
            <div className="text-3xl font-bold font-mono text-blue-600">34</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              Awaiting auto-release scan
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
                Verified
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-3">
              Telemetry streams active
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
            <Link href="/dashboard/ev-monitor" className="text-xs font-bold uppercase tracking-widest text-black/50 hover:text-black transition-colors">
              View All
            </Link>
          </div>

          <Card className="rounded-none border-black/20 shadow-none">
            <CardContent className="p-0">
              <div className="divide-y divide-black/10">
                {/* Watchlist Item 1 */}
                <div className="p-4 flex items-center justify-between bg-red-50/50 hover:bg-red-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="bg-red-100 p-2 text-red-600 shrink-0">
                      <Thermometer className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base">B-105</span>
                        <Badge variant="destructive" className="rounded-none text-[9px] uppercase tracking-widest">Reject</Badge>
                      </div>
                      <p className="text-xs text-black/60 font-medium mt-1">
                        WARNING: Temperature 37°C above safe range (35°C).
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xl font-bold text-red-600">37.0°C</div>
                    <div className="text-[10px] text-black/40 font-bold uppercase tracking-widest mt-1">Zone C · Rack 1</div>
                  </div>
                </div>

                {/* Watchlist Item 2 */}
                <div className="p-4 flex items-center justify-between bg-yellow-50/50 hover:bg-yellow-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="bg-yellow-100 p-2 text-yellow-600 shrink-0">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base">B-212</span>
                        <Badge variant="outline" className="rounded-none text-[9px] uppercase tracking-widest border-yellow-500 text-yellow-700 bg-yellow-100">On Hold</Badge>
                      </div>
                      <p className="text-xs text-black/60 font-medium mt-1">
                        Humidity anomaly detected (68%). Pending inspection.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xl font-bold text-yellow-600">26.5°C</div>
                    <div className="text-[10px] text-black/40 font-bold uppercase tracking-widest mt-1">Zone A · Rack 4</div>
                  </div>
                </div>

                {/* Watchlist Item 3 */}
                <div className="p-4 flex items-center justify-between hover:bg-black/5 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-2 text-blue-600 shrink-0">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base">B-109</span>
                        <Badge variant="outline" className="rounded-none text-[9px] uppercase tracking-widest border-blue-500 text-blue-700 bg-blue-50">Pending QA</Badge>
                      </div>
                      <p className="text-xs text-black/60 font-medium mt-1">
                        Arrived from LG Chem. Awaiting document extraction.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xl font-bold">23.5°C</div>
                    <div className="text-[10px] text-black/40 font-bold uppercase tracking-widest mt-1">Receiving Bay</div>
                  </div>
                </div>
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
                {/* Item 1 */}
                <div className="flex flex-col gap-2 pb-4 border-b border-black/10">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2 items-center">
                      <FileText className="h-4 w-4 text-black/60" />
                      <span className="text-sm font-bold font-mono">
                        PO-2026-X1
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="rounded-none text-[10px] bg-black text-white border-black font-bold uppercase tracking-wider"
                    >
                      Pending
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      Conf: <span className="font-mono text-black">0.82</span>
                    </span>
                    <span>2 mins ago</span>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex flex-col gap-2 pb-4 border-b border-black/10">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2 items-center">
                      <FileText className="h-4 w-4 text-black/60" />
                      <span className="text-sm font-bold font-mono">
                        INV-992-B
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="rounded-none text-[10px] bg-white text-black border-black/30 font-bold uppercase tracking-wider"
                    >
                      Released
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      Conf: <span className="font-mono text-black">0.98</span>
                    </span>
                    <span>1 hr ago</span>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="flex flex-col gap-2 pb-4 border-black/10">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2 items-center">
                      <FileText className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-bold font-mono text-red-600">
                        MANIFEST-A2
                      </span>
                    </div>
                    <Badge
                      variant="destructive"
                      className="rounded-none text-[10px] border-red-600 font-bold uppercase tracking-wider"
                    >
                      Rejected
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      Conf: <span className="font-mono text-red-600">0.45</span>
                    </span>
                    <span>3 hrs ago</span>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
}
