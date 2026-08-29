'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Zap, Cpu, TrendingUp, History, Trophy, BarChart3 } from 'lucide-react';

export function GraphPlaceholders({
  runtimeMs = 42,
  memoryMb = 14.5,
  averageRuntimeMs = 85,
  averageMemoryMb = 24.8,
  submissionHistory = [],
}) {
  const [activeTab, setActiveTab] = useState('distribution');

  // Percentiles
  const runtimePercentile = Math.min(99.4, Math.max(50.0, Math.round((1 - runtimeMs / (averageRuntimeMs * 2)) * 100 * 10) / 10));
  const memoryPercentile = Math.min(98.8, Math.max(52.0, Math.round((1 - memoryMb / (averageMemoryMb * 2)) * 100 * 10) / 10));

  const runtimeBuckets = [
    { ms: '0-20ms', pct: 15, current: runtimeMs <= 20 },
    { ms: '20-40ms', pct: 35, current: runtimeMs > 20 && runtimeMs <= 40 },
    { ms: '40-60ms', pct: 25, current: runtimeMs > 40 && runtimeMs <= 60 },
    { ms: '60-80ms', pct: 15, current: runtimeMs > 60 && runtimeMs <= 80 },
    { ms: '80ms+', pct: 10, current: runtimeMs > 80 },
  ];

  const memoryBuckets = [
    { mb: '0-10MB', pct: 20, current: memoryMb <= 10 },
    { mb: '10-20MB', pct: 45, current: memoryMb > 10 && memoryMb <= 20 },
    { mb: '20-30MB', pct: 20, current: memoryMb > 20 && memoryMb <= 30 },
    { mb: '30MB+', pct: 15, current: memoryMb > 30 },
  ];

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Top Percentile Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-sans uppercase font-semibold text-emerald-400 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5" /> Runtime Percentile
            </span>
            <div className="text-xl font-extrabold text-foreground tracking-tight font-mono">
              Beats <span className="text-emerald-500">{runtimePercentile}%</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-sans">
              Your runtime: <strong className="text-foreground">{runtimeMs} ms</strong> (Avg: {averageRuntimeMs} ms)
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
            ⚡
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/30 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-sans uppercase font-semibold text-indigo-400 flex items-center gap-1">
              <Cpu className="h-3.5 w-3.5" /> Memory Percentile
            </span>
            <div className="text-xl font-extrabold text-foreground tracking-tight font-mono">
              Beats <span className="text-indigo-500">{memoryPercentile}%</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-sans">
              Your memory: <strong className="text-foreground">{memoryMb} MB</strong> (Avg: {averageMemoryMb} MB)
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
            💾
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <Tabs defaultValue="distribution" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 h-8 bg-muted/60 p-1">
          <TabsTrigger value="distribution" className="text-[11px] py-1">
            <BarChart3 className="h-3 w-3 mr-1" /> Distributions
          </TabsTrigger>
          <TabsTrigger value="trend" className="text-[11px] py-1">
            <TrendingUp className="h-3 w-3 mr-1" /> Trends
          </TabsTrigger>
          <TabsTrigger value="history" className="text-[11px] py-1">
            <History className="h-3 w-3 mr-1" /> History
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="text-[11px] py-1">
            <Trophy className="h-3 w-3 mr-1" /> Leaderboard
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Histograms */}
        <TabsContent value="distribution" className="pt-3 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Runtime Graph Placeholder */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Zap className="h-3.5 w-3.5" /> Runtime Distribution (ms)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Higher = Faster</span>
              </div>
              <div className="h-32 flex items-end gap-2 pt-4 px-2 border-b border-slate-800">
                {runtimeBuckets.map((b, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      className={`w-full rounded-t transition-all ${
                        b.current ? 'bg-emerald-500 ring-2 ring-emerald-400/50' : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                      style={{ height: `${b.pct * 2.5}px` }}
                    />
                    <span className="text-[9px] font-mono text-slate-400">{b.ms}</span>
                    {b.current && (
                      <Badge className="absolute -top-6 bg-emerald-500 text-slate-950 text-[9px] font-bold px-1 py-0">
                        You
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Memory Graph Placeholder */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                <span className="flex items-center gap-1 text-indigo-400">
                  <Cpu className="h-3.5 w-3.5" /> Memory Usage Distribution (MB)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Lower = Leaner</span>
              </div>
              <div className="h-32 flex items-end gap-2 pt-4 px-2 border-b border-slate-800">
                {memoryBuckets.map((b, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      className={`w-full rounded-t transition-all ${
                        b.current ? 'bg-indigo-500 ring-2 ring-indigo-400/50' : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                      style={{ height: `${b.pct * 2.2}px` }}
                    />
                    <span className="text-[9px] font-mono text-slate-400">{b.mb}</span>
                    {b.current && (
                      <Badge className="absolute -top-6 bg-indigo-500 text-white text-[9px] font-bold px-1 py-0">
                        You
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Acceptance Trend */}
        <TabsContent value="trend" className="pt-3">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 text-xs">
              <TrendingUp className="h-3.5 w-3.5 text-amber-400" /> Acceptance Trend Graph
            </h4>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div>
                <p className="font-semibold text-slate-200 text-xs">Platform Overall Acceptance</p>
                <p className="text-slate-400 text-[11px]">Submissions across candidates</p>
              </div>
              <span className="text-xl font-extrabold text-amber-400 font-mono">68.4%</span>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Submission History */}
        <TabsContent value="history" className="pt-3">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 text-xs">
              <History className="h-3.5 w-3.5 text-violet-400" /> Historical Performance
            </h4>
            {submissionHistory.length > 0 ? (
              <div className="space-y-1.5 font-mono text-xs">
                {submissionHistory.slice(0, 5).map((sub, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Attempt #{submissionHistory.length - idx}</span>
                    <Badge variant="outline" className="text-[10px] border-slate-700">{sub.verdict}</Badge>
                    <span className="text-emerald-400 font-bold">{sub.runtimeMs} ms</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-4">No prior submissions recorded.</p>
            )}
          </div>
        </TabsContent>

        {/* Tab 4: Leaderboard Placeholder */}
        <TabsContent value="leaderboard" className="pt-3">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 text-xs">
              <Trophy className="h-3.5 w-3.5 text-amber-400" /> Top Performer Leaderboard
            </h4>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-amber-500/30">
                <span className="font-bold text-amber-400">#1 SpeedDemon</span>
                <span className="text-slate-300">12 ms / 2.5 MB</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span className="font-bold text-slate-300">#2 CodeMaster</span>
                <span className="text-slate-300">15 ms / 2.8 MB</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span className="font-bold text-slate-300">#3 AlgoNinja</span>
                <span className="text-slate-300">18 ms / 3.1 MB</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
