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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, Download, ArrowRight, RefreshCw } from "lucide-react";
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

export default function LogsPage() {
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">
            System Logs
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Immutable cyber-audit trail. Captures live state changes across the
            system.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-none font-bold uppercase tracking-widest text-xs h-10 px-4 gap-2 border-black/20 text-black hover:bg-black/5"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/50" />
          <Input
            placeholder="Search by ID, User, or Action..."
            className="rounded-none border-black/20 pl-10 h-10 focus-visible:ring-black/50 font-mono text-sm"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div
              role="button"
              tabIndex={0}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-none font-bold uppercase tracking-widest text-xs h-10 px-4 gap-2 border border-black/20 hover:bg-black/5 hover:text-black cursor-pointer"
            >
              <Filter className="h-4 w-4" />
              Filter
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="rounded-none border-black shadow-lg"
          >
            <DropdownMenuLabel className="font-bold uppercase tracking-widest text-xs">
              Filter by Action
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-black/10" />
            <DropdownMenuItem className="rounded-none cursor-pointer">
              QA_SCAN
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-none cursor-pointer">
              STATUS_CHANGE
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* TABLE SECTION */}
      <Card className="rounded-none border-black/20 shadow-none flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b border-black/10 py-3 bg-black/5 flex flex-row items-center justify-between">
          <CardTitle className="text-xs uppercase tracking-widest font-bold">
            Audit Trail Records
          </CardTitle>
          {isLoading && (
            <RefreshCw className="h-4 w-4 animate-spin text-black/50" />
          )}
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow className="border-b border-black/20 hover:bg-transparent">
                <TableHead className="font-bold uppercase tracking-widest text-xs text-black whitespace-nowrap">
                  Log ID / Time
                </TableHead>
                <TableHead className="font-bold uppercase tracking-widest text-xs text-black whitespace-nowrap">
                  User
                </TableHead>
                <TableHead className="font-bold uppercase tracking-widest text-xs text-black whitespace-nowrap">
                  Action
                </TableHead>
                <TableHead className="font-bold uppercase tracking-widest text-xs text-black whitespace-nowrap">
                  Target
                </TableHead>
                <TableHead className="font-bold uppercase tracking-widest text-xs text-black pl-8 w-[40%]">
                  Details
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errorMsg && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10 font-mono text-xs text-red-600 bg-red-50"
                  >
                    Error loading logs: {errorMsg}
                  </TableCell>
                </TableRow>
              )}
              {logs.length === 0 && !isLoading && !errorMsg && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10 font-mono text-xs text-black/50"
                  >
                    No logs recorded in the system yet.
                  </TableCell>
                </TableRow>
              )}
              {logs.map((log) => (
                <TableRow
                  key={log.id}
                  className="border-b border-black/10 hover:bg-black/5 transition-colors group"
                >
                  {/* ID & Timestamp */}
                  <TableCell className="align-top py-4">
                    <div className="font-mono text-sm font-bold">{log.id}</div>
                    <div className="font-mono text-xs text-black/50 mt-1">
                      {log.timestamp}
                    </div>
                  </TableCell>

                  {/* User & IP Address */}
                  <TableCell className="align-top py-4">
                    <div className="font-medium text-sm">{log.user}</div>
                    <div className="font-mono text-[10px] text-black/40 mt-1">
                      {log.ipAddress}
                    </div>
                  </TableCell>

                  {/* Action Badge */}
                  <TableCell className="align-top py-4">
                    <Badge
                      variant="outline"
                      className={`rounded-none text-[10px] font-bold uppercase tracking-widest border border-black/20
                        ${log.risk === "high" ? "bg-red-600 text-white border-red-600" : ""}
                        ${log.risk === "medium" ? "bg-black/10 text-black" : ""}
                        ${log.risk === "low" ? "bg-black text-white" : ""}
                      `}
                    >
                      {log.action}
                    </Badge>
                  </TableCell>

                  {/* Target Table */}
                  <TableCell className="align-top py-4">
                    <div className="font-mono text-xs bg-black/5 px-2 py-1 inline-block border border-black/10">
                      {log.target_table}
                    </div>
                  </TableCell>

                  {/* Description & Record ID */}
                  <TableCell className="align-top py-4 pl-8">
                    <div className="text-sm font-medium">{log.description}</div>
                    <div className="flex items-center gap-1 mt-1 text-xs font-mono text-black/50">
                      <ArrowRight className="h-3 w-3" />
                      Ref: {log.record_id}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PAGINATION (MOCK) */}
      <div className="flex items-center justify-between shrink-0 mt-4">
        <p className="text-xs font-medium text-black/50 uppercase tracking-widest">
          Showing 1-{Math.min(logs.length, 50)} of {logs.length} records
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-none border-black/20 text-xs font-bold uppercase tracking-widest"
            disabled
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-none border-black/20 text-xs font-bold uppercase tracking-widest bg-black text-white hover:bg-black/90"
          >
            1
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-none border-black/20 text-xs font-bold uppercase tracking-widest"
            disabled
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
