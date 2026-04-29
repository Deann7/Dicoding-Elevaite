"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Download,
  ArrowRight,
  RefreshCw,
  Eye,
  TrendingUp,
  AlertTriangle,
  Shield,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type LogRecord = {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target_table: string;
  record_id: string;
  description: string;
  ipAddress: string;
  risk: "high" | "medium" | "low";
};

function formatTime(dateString: string) {
  const d = new Date(dateString);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function getInitials(name: string) {
  return name
    .split(/[\s_-]+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getInitialColor(name: string) {
  const colors = [
    "bg-primary/20 text-primary",
    "bg-green-100 text-green-700",
    "bg-yellow-100 text-yellow-700",
    "bg-red-100 text-red-700",
    "bg-blue-100 text-blue-700",
    "bg-pink-100 text-pink-700",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const supabase = createClient();

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // Fetch Pallet Events
      const { data: palletEvents, error: e1 } = await supabase
        .from("pallet_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (e1) throw new Error(`pallet_events error: ${e1.message}`);

      // Fetch QA Inspections
      const { data: qaScans, error: e2 } = await supabase
        .from("qa_inspections")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (e2) throw new Error(`qa_inspections error: ${e2.message}`);

      const unifiedLogs: LogRecord[] = [];

      if (palletEvents) {
        palletEvents.forEach((ev) => {
          let risk: "high" | "medium" | "low" = "low";
          if (ev.new_status === "REJECT") risk = "high";
          else if (ev.new_status === "ON HOLD") risk = "medium";

          unifiedLogs.push({
            id: `EVT-${(ev.id || "").substring(0, 8).toUpperCase()}`,
            timestamp: ev.created_at ? formatTime(ev.created_at) : "N/A",
            user: ev.trigger_source || "SYSTEM",
            action: "STATUS_CHANGE",
            target_table: "pallets",
            record_id: ev.pallet_code || "UNKNOWN",
            description:
              ev.note ||
              `Changed status from '${ev.previous_status || "Unknown"}' to '${ev.new_status}'`,
            ipAddress: "DB_INTERNAL",
            risk,
          });
        });
      }

      if (qaScans) {
        qaScans.forEach((qa) => {
          const risk: "high" | "medium" | "low" = qa.passed_qa ? "low" : "high";
          unifiedLogs.push({
            id: `QA-${(qa.id || "").substring(0, 8).toUpperCase()}`,
            timestamp: qa.created_at ? formatTime(qa.created_at) : "N/A",
            user: qa.released_by || "AI Auto-Release",
            action: "QA_SCAN",
            target_table: "qa_inspections",
            record_id: qa.pallet_code || "UNKNOWN",
            description: qa.passed_qa
              ? `AI extraction passed. Confidence: ${qa.ai_confidence}`
              : `QA Failed: ${qa.fail_reason}`,
            ipAddress: "AI_SERVICE",
            risk,
          });
        });
      }

      // Sort descending by timestamp
      unifiedLogs.sort((a, b) => {
        const timeA =
          a.timestamp === "N/A" ? 0 : new Date(a.timestamp).getTime();
        const timeB =
          b.timestamp === "N/A" ? 0 : new Date(b.timestamp).getTime();
        return timeB - timeA;
      });

      setLogs(unifiedLogs.slice(0, 100));
    } catch (err: any) {
      console.error("Fetch Logs Error:", err);
      setErrorMsg(err.message || "Failed to load logs");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchLogs();

    const channel = supabase
      .channel("system-logs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "pallet_events" },
        (payload) => {
          const ev = payload.new;
          let risk: "high" | "medium" | "low" = "low";
          if (ev.new_status === "REJECT") risk = "high";
          else if (ev.new_status === "ON HOLD") risk = "medium";

          setLogs((prev) => [
            {
              id: `EVT-${ev.id.substring(0, 8).toUpperCase()}`,
              timestamp: formatTime(ev.created_at),
              user: ev.trigger_source || "SYSTEM",
              action: "STATUS_CHANGE",
              target_table: "pallets",
              record_id: ev.pallet_code,
              description:
                ev.note ||
                `Changed status from '${ev.previous_status || "Unknown"}' to '${ev.new_status}'`,
              ipAddress: "DB_INTERNAL",
              risk,
            },
            ...prev,
          ]);
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "qa_inspections" },
        (payload) => {
          const qa = payload.new;
          const risk: "high" | "medium" | "low" = qa.passed_qa ? "low" : "high";
          setLogs((prev) => [
            {
              id: `QA-${qa.id.substring(0, 8).toUpperCase()}`,
              timestamp: formatTime(qa.created_at),
              user: qa.released_by || "AI Auto-Release",
              action: "QA_SCAN",
              target_table: "qa_inspections",
              record_id: qa.pallet_code,
              description: qa.passed_qa
                ? `AI extraction passed. Confidence: ${qa.ai_confidence}`
                : `QA Failed: ${qa.fail_reason}`,
              ipAddress: "AI_SERVICE",
              risk,
            },
            ...prev,
          ]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLogs, supabase]);

  // Filter + search
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchQuery === "" ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.record_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Stats
  const totalCount = logs.length;
  const qaFailCount = logs.filter((l) => l.action === "QA_SCAN" && l.risk === "high").length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* ── HEADER ──────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Audit Trail Records
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            Real-time logging of all system interactions and AI-driven quality
            assurance events.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl font-heading text-sm font-semibold h-11 px-5 gap-2 border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-xl font-heading text-sm font-semibold h-11 px-5 gap-2 border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer bg-white">
              <Filter className="h-4 w-4" />
              Filters
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="rounded-xl border-slate-200 shadow-lg"
            >
              <DropdownMenuLabel className="font-heading font-bold text-xs uppercase tracking-widest text-slate-400">
                Filter by Action
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="rounded-lg cursor-pointer"
                onClick={() => { setActionFilter("all"); setCurrentPage(1); }}
              >
                All Actions
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-lg cursor-pointer"
                onClick={() => { setActionFilter("QA_SCAN"); setCurrentPage(1); }}
              >
                QA_SCAN
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-lg cursor-pointer"
                onClick={() => { setActionFilter("STATUS_CHANGE"); setCurrentPage(1); }}
              >
                STATUS_CHANGE
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── KPI STATS ───────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-100">
          <p className="font-data text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
            Total Logs (24H)
          </p>
          <p className="font-data text-3xl font-medium text-primary">
            {totalCount.toLocaleString()}
          </p>
          <p className="text-[10px] text-green-600 font-bold mt-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Live from Supabase
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-100">
          <p className="font-data text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
            QA Failures
          </p>
          <p className="font-data text-3xl font-medium text-red-600">
            {qaFailCount}
          </p>
          <p className="text-[10px] text-red-600 font-bold mt-2 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Requires Review
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-100">
          <p className="font-data text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
            System Uptime
          </p>
          <p className="font-data text-3xl font-medium text-green-600">
            99.98%
          </p>
          <p className="text-[10px] text-green-600 font-bold mt-2 flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Stable Performance
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-100">
          <p className="font-data text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
            Active Sessions
          </p>
          <p className="font-data text-3xl font-medium text-slate-900">
            18
          </p>
          <p className="text-[10px] text-slate-500 font-bold mt-2 flex items-center gap-1">
            <Users className="h-3 w-3" />
            Current Operators
          </p>
        </div>
      </div>

      {/* ── SEARCH BAR ──────────────────────────────── */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Filter by User, Action, or Target ID..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="rounded-xl border-slate-200 pl-11 h-11 bg-white focus-visible:ring-primary/20 focus-visible:border-primary text-sm transition-all"
          />
        </div>
        {actionFilter !== "all" && (
          <Badge
            className="rounded-full bg-primary/10 text-primary border-0 px-3 py-1.5 font-heading text-xs font-semibold cursor-pointer hover:bg-primary/20"
            onClick={() => setActionFilter("all")}
          >
            {actionFilter} ✕
          </Badge>
        )}
      </div>

      {/* ── TABLE ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        {/* Table header bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="font-data text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Audit Trail Records
          </span>
          {isLoading && (
            <RefreshCw className="h-4 w-4 animate-spin text-primary" />
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100 hover:bg-transparent">
                <TableHead className="font-data text-[10px] font-semibold uppercase tracking-widest text-slate-400 whitespace-nowrap py-4 px-6">
                  Log ID / Time
                </TableHead>
                <TableHead className="font-data text-[10px] font-semibold uppercase tracking-widest text-slate-400 whitespace-nowrap py-4">
                  User
                </TableHead>
                <TableHead className="font-data text-[10px] font-semibold uppercase tracking-widest text-slate-400 whitespace-nowrap py-4">
                  Action
                </TableHead>
                <TableHead className="font-data text-[10px] font-semibold uppercase tracking-widest text-slate-400 whitespace-nowrap py-4">
                  Target
                </TableHead>
                <TableHead className="font-data text-[10px] font-semibold uppercase tracking-widest text-slate-400 py-4">
                  Details
                </TableHead>
                <TableHead className="font-data text-[10px] font-semibold uppercase tracking-widest text-slate-400 whitespace-nowrap py-4 text-right pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errorMsg && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-sm text-red-600 bg-red-50"
                  >
                    <AlertTriangle className="h-5 w-5 mx-auto mb-2" />
                    Error loading logs: {errorMsg}
                  </TableCell>
                </TableRow>
              )}
              {paginatedLogs.length === 0 && !isLoading && !errorMsg && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-16 text-sm text-slate-400"
                  >
                    No logs recorded in the system yet.
                  </TableCell>
                </TableRow>
              )}
              {paginatedLogs.map((log) => {
                const actionBadgeStyle =
                  log.action === "QA_SCAN"
                    ? log.risk === "high"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-primary/10 text-primary border-primary/20"
                    : log.action === "STATUS_CHANGE"
                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                      : "bg-slate-100 text-slate-600 border-slate-200";

                return (
                  <TableRow
                    key={log.id}
                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group"
                  >
                    {/* ID & Timestamp */}
                    <TableCell className="align-top py-5 px-6">
                      <div className="font-heading text-sm font-bold text-slate-900">
                        #{log.id}
                      </div>
                      <div className="font-data text-[11px] text-slate-400 mt-1">
                        {log.timestamp}
                      </div>
                    </TableCell>

                    {/* User */}
                    <TableCell className="align-top py-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${getInitialColor(log.user)}`}
                        >
                          {getInitials(log.user)}
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {log.user}
                        </span>
                      </div>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="align-top py-5">
                      <Badge
                        className={`rounded-full text-[10px] font-bold uppercase tracking-wider border px-2.5 py-1 gap-1 ${actionBadgeStyle}`}
                      >
                        {log.action === "QA_SCAN" && "⚡ "}
                        {log.action === "STATUS_CHANGE" && "⟳ "}
                        {log.action === "ERROR_REPORT" && "⚠ "}
                        {log.action}
                      </Badge>
                    </TableCell>

                    {/* Target */}
                    <TableCell className="align-top py-5">
                      <span className="font-data text-xs text-slate-700 font-medium">
                        {log.record_id}
                      </span>
                    </TableCell>

                    {/* Details */}
                    <TableCell className="align-top py-5 max-w-[250px]">
                      <p className="text-sm text-slate-600 truncate">
                        {log.description}
                      </p>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="align-top py-5 text-right pr-6">
                      <button className="text-slate-300 hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                        <Eye className="h-5 w-5" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── PAGINATION ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs font-medium text-slate-400 font-data">
          Showing {filteredLogs.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of{" "}
          {filteredLogs.length.toLocaleString()} entries
        </p>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl border-slate-200 h-9 w-9"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            return (
              <Button
                key={pageNum}
                variant="outline"
                size="sm"
                className={`rounded-xl border-slate-200 text-xs font-heading font-semibold w-9 h-9 p-0 ${
                  currentPage === pageNum
                    ? "bg-primary text-white border-primary hover:bg-primary/90"
                    : "hover:bg-slate-50"
                }`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <>
              <span className="text-slate-300 text-xs px-1">…</span>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-slate-200 text-xs font-heading font-semibold w-9 h-9 p-0 hover:bg-slate-50"
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl border-slate-200 h-9 w-9"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
