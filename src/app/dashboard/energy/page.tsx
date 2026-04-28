"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, TrendingDown, Leaf, Zap, BrainCircuit } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const trendData = [
  { time: "00:00", manual: 400, optimized: 350 },
  { time: "04:00", manual: 380, optimized: 340 },
  { time: "08:00", manual: 850, optimized: 650 },
  { time: "12:00", manual: 1200, optimized: 850 },
  { time: "16:00", manual: 1100, optimized: 780 },
  { time: "20:00", manual: 700, optimized: 520 },
  { time: "23:59", manual: 450, optimized: 380 },
];

const statusDrainData = [
  { status: "Released", kWh: 320, fill: "#e5e5e5" }, // Light grey
  { status: "On-Hold", kWh: 480, fill: "#888888" },  // Mid grey
  { status: "Reject", kWh: 1250, fill: "#000000" },  // Solid black
];

const chartConfig = {
  manual: {
    label: "Manual (Projected)",
    color: "#888888",
  },
  optimized: {
    label: "Optimized (AI)",
    color: "#000000",
  },
};

export default function EnergyDashboard() {
  const [loading, setLoading] = useState(true);

  // Simulate data fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">Energy & Sustainability</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Bridging operational efficiency with financial and environmental savings.
          </p>
        </div>
        <Tabs defaultValue="24h" className="w-[300px]">
          <TabsList className="grid w-full grid-cols-3 rounded-none p-0 h-9 border border-black/20 bg-transparent">
            <TabsTrigger value="24h" className="rounded-none data-[state=active]:bg-black data-[state=active]:text-white text-xs font-bold uppercase tracking-wide h-full">24H</TabsTrigger>
            <TabsTrigger value="7d" className="rounded-none data-[state=active]:bg-black data-[state=active]:text-white text-xs font-bold uppercase tracking-wide h-full">7D</TabsTrigger>
            <TabsTrigger value="30d" className="rounded-none data-[state=active]:bg-black data-[state=active]:text-white text-xs font-bold uppercase tracking-wide h-full">30D</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* KPI STATS ROW */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-none border-black/20 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs uppercase tracking-widest font-bold">Energy Saved</CardTitle>
            <Zap className="h-4 w-4 text-black/50" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-24 bg-black/10 rounded-none mb-1" />
            ) : (
              <div className="text-3xl font-bold font-mono">1,420 <span className="text-sm font-sans font-medium text-black/50">kWh</span></div>
            )}
            <p className="text-xs text-muted-foreground font-medium mt-1">vs projected manual baseline</p>
          </CardContent>
        </Card>

        <Card className="rounded-none border-black/20 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs uppercase tracking-widest font-bold">Cost Efficiency</CardTitle>
            <TrendingDown className="h-4 w-4 text-black/50" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-32 bg-black/10 rounded-none mb-1" />
            ) : (
              <div className="text-3xl font-bold font-mono text-black">
                <span className="text-sm font-sans font-medium text-black/50">Rp</span> 2.13<span className="text-xl">M</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground font-medium mt-1">Tariff: Rp 1,500 / kWh</p>
          </CardContent>
        </Card>

        <Card className="rounded-none border-black/20 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs uppercase tracking-widest font-bold">Carbon Offset</CardTitle>
            <Leaf className="h-4 w-4 text-black/50" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-28 bg-black/10 rounded-none mb-1" />
            ) : (
              <div className="text-3xl font-bold font-mono text-black">1.12 <span className="text-sm font-sans font-medium text-black/50">Tons</span></div>
            )}
            <p className="text-xs text-muted-foreground font-medium mt-1">Est. CO2 emissions prevented</p>
          </CardContent>
        </Card>

        <Card className="rounded-none border-black border-2 shadow-none bg-black text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4">
             <AlertTriangle className="w-32 h-32" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs uppercase tracking-widest font-bold text-white/80">Waste Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent className="relative z-10">
            {loading ? (
              <Skeleton className="h-9 w-24 bg-white/20 rounded-none mb-1" />
            ) : (
              <div className="text-3xl font-bold font-mono text-white mb-1">
                420 <span className="text-sm font-sans font-medium text-white/70">kWh</span>
              </div>
            )}
            <p className="text-xs text-white/80 font-bold mt-1 uppercase tracking-wider">
              Consumed by Reject Items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI INSIGHTS BAR */}
      <Card className="rounded-none border-black/30 shadow-none bg-[#fafafa]">
        <CardContent className="p-4 flex items-start sm:items-center gap-4">
          <div className="bg-black text-white p-2 shrink-0">
             <BrainCircuit className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold uppercase tracking-widest mb-1">AI-Driven Optimization Insight</h4>
            <p className="text-sm font-medium text-black/80 font-mono leading-relaxed">
              <span className="font-bold text-black uppercase">Peringatan:</span> Zona B mengonsumsi listrik 15% lebih tinggi dari baseline karena penumpukan barang <span className="underline decoration-black underline-offset-2 font-bold">REJECT</span> selama 48 jam. Segera pindahkan barang untuk menghemat <span className="bg-black/10 px-1">Rp 150.000/hari</span>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CHARTS GRID */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Main Trend Chart */}
        <Card className="rounded-none border-black/20 shadow-none col-span-2 flex flex-col min-h-[400px]">
          <CardHeader className="border-b border-black/10 shrink-0">
            <CardTitle className="text-sm uppercase tracking-widest font-bold">Energy Baseline vs AI Optimization</CardTitle>
            <CardDescription className="text-xs font-mono uppercase">Cumulative kWh usage over time</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1 h-full">
            {loading ? (
              <div className="w-full h-full flex flex-col gap-2">
                <Skeleton className="w-full h-full bg-black/5 rounded-none" />
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height={300} minWidth={0}>
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <pattern id="diagonalHatch" width="4" height="4" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="0" x2="0" y2="4" stroke="#cccccc" strokeWidth="1" />
                      </pattern>
                      <linearGradient id="colorOptimized" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontFamily: 'monospace' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    {/* Manual Projection - Dashed area to represent the 'Savings zone' gap */}
                    <Area 
                      type="monotone" 
                      dataKey="manual" 
                      stroke="#888888" 
                      strokeDasharray="5 5"
                      fill="url(#diagonalHatch)" 
                      fillOpacity={0.5} 
                    />
                    {/* Optimized Actual - Solid black line with smooth gradient */}
                    <Area 
                      type="monotone" 
                      dataKey="optimized" 
                      stroke="#000000" 
                      strokeWidth={2}
                      fill="url(#colorOptimized)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Status Drain Bar Chart */}
        <Card className="rounded-none border-black/20 shadow-none flex flex-col min-h-[400px]">
          <CardHeader className="border-b border-black/10 shrink-0">
            <CardTitle className="text-sm uppercase tracking-widest font-bold">Drain By Status</CardTitle>
            <CardDescription className="text-xs font-mono uppercase">Energy spent maintaining states</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1 h-full flex flex-col">
            {loading ? (
              <div className="w-full h-full flex flex-col justify-end gap-4 min-h-[300px]">
                <Skeleton className="w-[30%] h-8 bg-black/10 rounded-none" />
                <Skeleton className="w-[50%] h-8 bg-black/20 rounded-none" />
                <Skeleton className="w-[90%] h-8 bg-black/30 rounded-none" />
              </div>
            ) : (
              <>
                <div className="flex-1 h-[250px]">
                  <ResponsiveContainer width="100%" height={250} minWidth={0}>
                    <BarChart data={statusDrainData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e5e5" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="status" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#000", fontWeight: 700 }} width={70} />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }} 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-black text-white p-2 font-mono text-xs shadow-lg">
                                <span className="font-bold opacity-70">{payload[0].payload.status.toUpperCase()}</span>
                                <div className="mt-1">{payload[0].value} kWh</div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="kWh" radius={[0, 0, 0, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 pt-4 border-t border-black/10 text-center shrink-0">
                   <p className="text-[10px] uppercase font-bold tracking-widest text-red-600">
                      Highest Waste Factor: REJECT
                   </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
