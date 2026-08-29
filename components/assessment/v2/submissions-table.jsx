'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MonacoCodeEditor } from '../monaco-code-editor';
import { CheckCircle2, XCircle, Clock, Cpu, AlertTriangle, Eye, ChevronDown, ChevronUp } from 'lucide-react';

export function SubmissionsTable({ submissions = [] }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const getVerdictBadge = (verdict) => {
    switch (verdict) {
      case 'ACCEPTED':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs flex items-center gap-1 font-bold">
            <CheckCircle2 className="h-3.5 w-3.5" /> Accepted
          </Badge>
        );
      case 'WRONG_ANSWER':
        return (
          <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/30 text-xs flex items-center gap-1 font-bold">
            <XCircle className="h-3.5 w-3.5" /> Wrong Answer
          </Badge>
        );
      case 'TIME_LIMIT_EXCEEDED':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs flex items-center gap-1 font-bold">
            <Clock className="h-3.5 w-3.5" /> TLE
          </Badge>
        );
      case 'MEMORY_LIMIT_EXCEEDED':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs flex items-center gap-1 font-bold">
            <Cpu className="h-3.5 w-3.5" /> MLE
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/30 text-xs flex items-center gap-1 font-bold">
            {verdict?.replace(/_/g, ' ')}
          </Badge>
        );
    }
  };

  if (!submissions || submissions.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-dashed border-border/50 text-center text-xs text-muted-foreground">
        No submission attempts recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-3 font-sans text-xs">
      <h4 className="font-bold text-sm text-foreground tracking-tight">Submission History</h4>
      <div className="border border-border/50 rounded-xl overflow-hidden bg-card/80">
        <Table>
          <TableHeader className="bg-muted/40 text-[11px] uppercase">
            <TableRow>
              <TableHead>Verdict</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Runtime</TableHead>
              <TableHead>Memory</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((sub, idx) => {
              const isExpanded = expandedIndex === idx;
              const subDate = sub.createdAt
                ? new Date(sub.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : 'Just now';

              return (
                <div key={sub.id || idx} className="contents">
                  <TableRow className="font-mono text-xs hover:bg-muted/30 transition-colors">
                    <TableCell>{getVerdictBadge(sub.verdict)}</TableCell>
                    <TableCell className="uppercase font-semibold text-slate-300">{sub.language}</TableCell>
                    <TableCell className="text-emerald-400 font-bold">{sub.runtimeMs} ms</TableCell>
                    <TableCell className="text-indigo-400 font-bold">{sub.memoryMb || 14.2} MB</TableCell>
                    <TableCell className="text-slate-400 font-sans text-[11px]">{subDate}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                        className="text-xs text-violet-500 hover:text-violet-600 flex items-center gap-1 ml-auto"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {isExpanded ? 'Hide Code' : 'View Code'}
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </Button>
                    </TableCell>
                  </TableRow>

                  {/* Inline Code Expander (Zero Popups!) */}
                  {isExpanded && (
                    <TableRow className="bg-slate-950/80">
                      <TableCell colSpan={6} className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800 pb-1.5">
                            <span>Submitted Code ({sub.language}):</span>
                            <span>ID: {sub.id ? sub.id.substring(0, 10) : `SUB-${idx}`}</span>
                          </div>
                          <div className="h-56 rounded-lg overflow-hidden border border-slate-800">
                            <MonacoCodeEditor
                              value={sub.code || '# Code unavailable'}
                              onChange={() => {}}
                              language={sub.language || 'python'}
                              readOnly={true}
                            />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </div>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
