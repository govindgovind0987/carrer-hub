'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Terminal, FileCode, CheckCircle2, Info, Sliders, AlertTriangle, ShieldCheck } from 'lucide-react';

export function SampleTestcasesBrowser({ testCases = [] }) {
  const [activeTab, setActiveTab] = useState(0);

  // Guarantee 10 distinct sample test cases
  const sampleCases = (testCases.length >= 10 ? testCases : [
    ...testCases,
    { input: '5\n10 20 30 40 50\n70', expectedOutput: '2 3', explanation: 'Elements 30 + 40 = 70', constraintsInvolved: '1 <= N <= 10^5', edgeCaseNotes: 'Standard array bounds' },
    { input: '4\n-5 -10 -15 -20\n-25', expectedOutput: '1 2', explanation: 'All negative elements (-10) + (-15) = -25', constraintsInvolved: 'Negative integers', edgeCaseNotes: 'Negative target' },
    { input: '6\n1 2 3 4 5 6\n11', expectedOutput: '4 5', explanation: 'Sequential array bounds 5 + 6 = 11', constraintsInvolved: 'Sorted array', edgeCaseNotes: 'Adjacent elements' },
    { input: '5\n0 0 0 5 5\n10', expectedOutput: '3 4', explanation: 'Multiple zero values preceding target', constraintsInvolved: 'Zero array elements', edgeCaseNotes: 'Leading zero check' },
    { input: '4\n100 200 300 400\n700', expectedOutput: '2 3', explanation: 'Hundreds magnitude values 300 + 400 = 700', constraintsInvolved: 'Large integers', edgeCaseNotes: 'Hundreds scale' },
    { input: '5\n1 10 100 1000 10000\n1010', expectedOutput: '2 3', explanation: 'Powers of 10 array values', constraintsInvolved: 'Varied magnitudes', edgeCaseNotes: 'Wide scale gap' },
    { input: '6\n-50 50 -100 100 -150 150\n0', expectedOutput: '0 1', explanation: 'Symmetric zero sum (-50) + 50 = 0', constraintsInvolved: 'Zero target', edgeCaseNotes: 'Opposite sign pairs' },
    { input: '4\n999 1 998 2\n1000', expectedOutput: '0 1', explanation: 'Max target sum 999 + 1 = 1000', constraintsInvolved: 'Extreme bounds', edgeCaseNotes: 'Boundary elements' },
    { input: '5\n7 14 21 28 35\n49', expectedOutput: '1 4', explanation: 'Multiples of 7: 14 + 35 = 49', constraintsInvolved: 'Arithmetic sequence', edgeCaseNotes: 'Non-adjacent indices' },
    { input: '3\n500000 500000 1000000\n1000000', expectedOutput: '0 1', explanation: 'Large integers 500k + 500k = 1M', constraintsInvolved: '32-bit overflow check', edgeCaseNotes: 'Max integer bounds' },
  ]).slice(0, 10);

  const currentSample = sampleCases[activeTab] || sampleCases[0];

  return (
    <div className="space-y-4 pt-4 border-t border-border/40">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-sm text-foreground tracking-tight flex items-center gap-1.5">
          <Terminal className="h-4 w-4 text-violet-500" /> Sample Test Cases
        </h4>
        <Badge variant="outline" className="text-xs border-violet-500/30 text-violet-600 font-mono">
          10 Sample Cases
        </Badge>
      </div>

      {/* Horizontal Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-muted/40 rounded-xl border border-border/50 scrollbar-thin">
        {sampleCases.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all whitespace-nowrap flex items-center gap-1 ${
              activeTab === idx
                ? 'bg-violet-600 text-white font-bold shadow-md ring-1 ring-violet-400'
                : 'text-muted-foreground bg-muted/50 hover:bg-muted hover:text-foreground'
            }`}
          >
            <Terminal className="h-3 w-3" />
            Sample {idx + 1}
          </button>
        ))}
      </div>

      {/* Selected Sample Content Card */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs text-slate-200 shadow-lg">
        <div className="flex items-center justify-between text-[11px] font-sans font-bold text-violet-400 border-b border-slate-800 pb-2">
          <span>Sample #{activeTab + 1} Breakdown</span>
          <span className="text-slate-400 font-normal">Click tabs above to switch</span>
        </div>

        {/* Input */}
        <div className="space-y-1">
          <span className="text-slate-400 text-[11px] font-sans font-semibold uppercase tracking-wider flex items-center gap-1">
            <FileCode className="h-3.5 w-3.5 text-violet-400" /> Input:
          </span>
          <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 whitespace-pre-wrap">
            {currentSample.input}
          </pre>
        </div>

        {/* Expected Output */}
        <div className="space-y-1">
          <span className="text-slate-400 text-[11px] font-sans font-semibold uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" /> Expected Output:
          </span>
          <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 whitespace-pre-wrap">
            {currentSample.expectedOutput}
          </pre>
        </div>

        {/* Explanation */}
        {currentSample.explanation && (
          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] font-sans font-semibold uppercase tracking-wider flex items-center gap-1">
              <Info className="h-3.5 w-3.5 text-blue-400" /> Explanation:
            </span>
            <p className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-slate-300 font-sans text-xs italic">
              {currentSample.explanation}
            </p>
          </div>
        )}

        {/* Constraints & Edge Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 font-sans text-[11px]">
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-0.5">
            <span className="text-indigo-400 font-semibold flex items-center gap-1">
              <Sliders className="h-3 w-3" /> Constraints:
            </span>
            <span className="text-slate-300">
              {currentSample.constraintsInvolved || 'Standard input range constraints'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-0.5">
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Edge Notes:
            </span>
            <span className="text-slate-300">
              {currentSample.edgeCaseNotes || 'Validates standard boundary inputs'}
            </span>
          </div>
        </div>
      </div>

      {/* Hidden Testcases Summary Card */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/30 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-indigo-400 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" /> Hidden Testcases
          </span>
          <Badge className="bg-indigo-500 text-white text-[10px]">20+ Hidden Cases</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground font-sans">
          <span className="flex items-center gap-1">✓ Used during submission</span>
          <span className="flex items-center gap-1">✓ Edge cases</span>
          <span className="flex items-center gap-1">✓ Large constraints</span>
          <span className="flex items-center gap-1">✓ Stress tests</span>
        </div>
      </div>
    </div>
  );
}
