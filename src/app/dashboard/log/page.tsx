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
import { Search, Filter, Download, ArrowRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MOCK_LOGS = [
  {
    id: "LOG-9281",
    timestamp: "2026-04-07 14:32:05",
    user: "Admin @factory",
    action: "STATUS_CHANGE",
    target_table: "inventory",
    record_id: "itm_4829a",
    description: "Changed status from 'unreleased' to 'released'",
    ipAddress: "192.168.1.45",
    risk: "low",
  },
  {
    id: "LOG-9280",
    timestamp: "2026-04-07 13:15:22",
    user: "System",
    action: "UPDATE",
    target_table: "inventory_scans",
    record_id: "scn_9921b",
    description: "Azure AI extraction completed with 0.98 confidence",
    ipAddress: "10.0.0.1",
    risk: "low",
  },
  {
    id: "LOG-9279",
    timestamp: "2026-04-07 11:05:11",
    user: "Admin @factory",
    action: "DELETE",
    target_table: "zones",
    record_id: "zn_112",
    description: "Deleted unused production zone B2",
    ipAddress: "192.168.1.45",
    risk: "high",
  },
  {
    id: "LOG-9278",
    timestamp: "2026-04-07 09:44:30",
    user: "Staff @factory",
    action: "UPDATE",
    target_table: "inventory",
    record_id: "itm_3311c",
    description: "Quantity adjusted from 50 to 48",
    ipAddress: "192.168.1.50",
    risk: "medium",
  },
  {
    id: "LOG-9277",
    timestamp: "2026-04-07 08:30:00",
    user: "System",
    action: "ALERT",
    target_table: "zones",
    record_id: "zn_cold1",
    description: "Temperature drop detected (-4°C)",
    ipAddress: "10.0.0.1",
    risk: "high",
  },
  {
    id: "LOG-9276",
    timestamp: "2026-04-06 18:20:15",
    user: "Staff @factory",
    action: "INSERT",
    target_table: "inventory_scans",
    record_id: "scn_9920a",
    description: "Uploaded new supplier manifest",
    ipAddress: "192.168.1.50",
    risk: "low",
  },
];

export default function LogsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">System Logs</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Immutable cyber-audit trail. Captures state changes across the system.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-none font-bold uppercase tracking-widest text-xs h-10 px-4 gap-2 border-black/20 text-black hover:bg-black/5">
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
          <DropdownMenuTrigger asChild>
            <div role="button" tabIndex={0} className="inline-flex items-center justify-center whitespace-nowrap rounded-none font-bold uppercase tracking-widest text-xs h-10 px-4 gap-2 border border-black/20 hover:bg-black/5 hover:text-black cursor-pointer">
              <Filter className="h-4 w-4" />
              Filter
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-none border-black shadow-lg">
            <DropdownMenuLabel className="font-bold uppercase tracking-widest text-xs">Filter by Action</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-black/10" />
            <DropdownMenuItem className="rounded-none cursor-pointer">INSERT</DropdownMenuItem>
            <DropdownMenuItem className="rounded-none cursor-pointer">UPDATE</DropdownMenuItem>
            <DropdownMenuItem className="rounded-none cursor-pointer">DELETE</DropdownMenuItem>
            <DropdownMenuItem className="rounded-none cursor-pointer">STATUS_CHANGE</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* TABLE SECTION */}
      <Card className="rounded-none border-black/20 shadow-none flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b border-black/10 py-3 bg-black/5">
          <CardTitle className="text-xs uppercase tracking-widest font-bold">Audit Trail Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-white">
              <TableRow className="border-b border-black/20 hover:bg-transparent">
                <TableHead className="font-bold uppercase tracking-widest text-xs text-black whitespace-nowrap">Log ID / Time</TableHead>
                <TableHead className="font-bold uppercase tracking-widest text-xs text-black whitespace-nowrap">User</TableHead>
                <TableHead className="font-bold uppercase tracking-widest text-xs text-black whitespace-nowrap">Action</TableHead>
                <TableHead className="font-bold uppercase tracking-widest text-xs text-black whitespace-nowrap">Target</TableHead>
                <TableHead className="font-bold uppercase tracking-widest text-xs text-black pl-8 w-[40%]">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_LOGS.map((log) => (
                <TableRow key={log.id} className="border-b border-black/10 hover:bg-black/5 transition-colors group">
                  {/* ID & Timestamp */}
                  <TableCell className="align-top py-4">
                    <div className="font-mono text-sm font-bold">{log.id}</div>
                    <div className="font-mono text-xs text-black/50 mt-1">{log.timestamp}</div>
                  </TableCell>

                  {/* User & IP Address */}
                  <TableCell className="align-top py-4">
                    <div className="font-medium text-sm">{log.user}</div>
                    <div className="font-mono text-[10px] text-black/40 mt-1">{log.ipAddress}</div>
                  </TableCell>

                  {/* Action Badge */}
                  <TableCell className="align-top py-4">
                    <Badge 
                      variant="outline" 
                      className={`rounded-none text-[10px] font-bold uppercase tracking-widest border border-black/20
                        ${log.risk === 'high' ? 'bg-red-600 text-white border-red-600' : ''}
                        ${log.risk === 'medium' ? 'bg-black/10 text-black' : ''}
                        ${log.risk === 'low' ? 'bg-black text-white' : ''}
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
      <div className="flex items-center justify-between shrink-0">
        <p className="text-xs font-medium text-black/50 uppercase tracking-widest">Showing 1-6 of 2,491 records</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-none border-black/20 text-xs font-bold uppercase tracking-widest" disabled>Prev</Button>
          <Button variant="outline" size="sm" className="rounded-none border-black/20 text-xs font-bold uppercase tracking-widest bg-black text-white hover:bg-black/90">1</Button>
          <Button variant="outline" size="sm" className="rounded-none border-black/20 text-xs font-bold uppercase tracking-widest">2</Button>
          <Button variant="outline" size="sm" className="rounded-none border-black/20 text-xs font-bold uppercase tracking-widest">3</Button>
          <Button variant="outline" size="sm" className="rounded-none border-black/20 text-xs font-bold uppercase tracking-widest">Next</Button>
        </div>
      </div>
    </div>
  );
}
