'use client';

import { useState } from 'react';
import { MonacoCodeEditor } from '../monaco-code-editor';
import { GraphPlaceholders } from './graph-placeholders';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Terminal,
  AlertTriangle,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

export function EditorConsolePanel({
  problem,
  language,
  onLanguageChange,
  code,
  onCodeChange,
  onResetCode,
  isEvaluating,
  onRunCode,
  onSubmitSolution,
  executionResult,
  submissionResult,
  customInput,
  onCustomInputChange,
}) {
  const [activeConsoleTab, setActiveConsoleTab] = useState('input');
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    toast.info(!isFullscreen ? 'Entered Fullscreen Mode' : 'Exited Fullscreen Mode');
  };

  const getVerdictBadge = (verdict) => {
    switch (verdict) {
      case 'ACCEPTED':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-xs py-1 px-2.5 font-bold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Accepted
          </Badge>
        );
      case 'WRONG_ANSWER':
        return (
          <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/40 text-xs py-1 px-2.5 font-bold flex items-center gap-1">
            <XCircle className="h-3.5 w-3.5" /> Wrong Answer
          </Badge>
        );
      case 'TIME_LIMIT_EXCEEDED':
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40 text-xs py-1 px-2.5 font-bold flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Time Limit Exceeded
          </Badge>
        );
      case 'MEMORY_LIMIT_EXCEEDED':
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40 text-xs py-1 px-2.5 font-bold flex items-center gap-1">
            <Cpu className="h-3.5 w-3.5" /> Memory Limit Exceeded
          </Badge>
        );
      case 'COMPILATION_ERROR':
        return (
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/40 text-xs py-1 px-2.5 font-bold flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" /> Compilation Error
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/40 text-xs py-1 px-2.5 font-bold flex items-center gap-1">
            {verdict?.replace(/_/g, ' ')}
          </Badge>
        );
    }
  };

  return (
    <div
      className={`flex flex-col gap-3 overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 bg-background p-4' : 'h-full'
      }`}
    >
      {/* Editor Control Toolbar */}
      <div className="flex items-center justify-between bg-card/60 backdrop-blur-xl border border-border/50 p-2.5 rounded-xl flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground">Language:</span>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-muted text-xs font-mono font-bold px-3 py-1 rounded-lg border border-border/60 focus:outline-none cursor-pointer"
            >
              <option value="python">Python 3</option>
              <option value="java">Java 17</option>
              <option value="cpp">C++</option>
            </select>
          </div>

          {/* Font Size Selector */}
          <div className="flex items-center gap-1 border-l border-border/50 pl-2">
            <span className="text-xs font-semibold text-muted-foreground">Font:</span>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="bg-muted text-xs font-mono px-2 py-1 rounded-lg border border-border/60 cursor-pointer"
            >
              {[12, 13, 14, 15, 16, 18, 20].map((sz) => (
                <option key={sz} value={sz}>
                  {sz}px
                </option>
              ))}
            </select>
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditorTheme(editorTheme === 'vs-dark' ? 'light' : 'vs-dark')}
            className="text-xs text-muted-foreground py-1 px-2"
          >
            {editorTheme === 'vs-dark' ? <Moon className="h-3.5 w-3.5 mr-1" /> : <Sun className="h-3.5 w-3.5 mr-1" />}
            {editorTheme === 'vs-dark' ? 'Dark' : 'Light'}
          </Button>

          {/* Auto-save Status */}
          <span className="text-[11px] text-muted-foreground flex items-center gap-1 hidden sm:inline-flex font-mono">
            <Save className="h-3 w-3 text-emerald-500" /> Auto Saved
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onResetCode} className="text-xs text-muted-foreground">
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
          </Button>

          <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="text-xs text-muted-foreground">
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>

          <Button
            onClick={onRunCode}
            disabled={isEvaluating || !code.trim()}
            variant="outline"
            size="sm"
            className="text-xs border-violet-500/30 text-violet-600 hover:bg-violet-500/10"
          >
            <Play className="h-3.5 w-3.5 mr-1 fill-current" /> Run Code
          </Button>

          <Button
            onClick={() => {
              setActiveConsoleTab('result');
              onSubmitSolution();
            }}
            disabled={isEvaluating || !code.trim()}
            size="sm"
            className="text-xs bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-md"
          >
            <Send className="h-3.5 w-3.5 mr-1" /> Submit Solution
          </Button>
        </div>
      </div>

      {/* Monaco Code Editor Container */}
      <div className="flex-1 min-h-[300px] rounded-xl overflow-hidden border border-border/50">
        <MonacoCodeEditor
          value={code}
          onChange={onCodeChange}
          language={language}
          theme={editorTheme}
          fontSize={fontSize}
          onRun={onRunCode}
          onSubmit={onSubmitSolution}
          isEvaluating={isEvaluating}
        />
      </div>

      {/* Bottom Console Panel (No Popups!) */}
      <Card className="border-border/60 bg-card/90 backdrop-blur-xl h-64 flex flex-col overflow-hidden">
        <div className="border-b border-border/40 bg-muted/20 px-3 py-1.5 flex items-center justify-between">
          <Tabs defaultValue="input" value={activeConsoleTab} onValueChange={setActiveConsoleTab}>
            <TabsList className="h-7 bg-muted/60 p-0.5">
              <TabsTrigger value="input" className="text-[11px] py-0.5 px-2">
                <Terminal className="h-3 w-3 mr-1" /> Custom Stdin Input
              </TabsTrigger>
              <TabsTrigger value="output" className="text-[11px] py-0.5 px-2">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Run Output & Logs
              </TabsTrigger>
              <TabsTrigger value="result" className="text-[11px] py-0.5 px-2">
                <Send className="h-3 w-3 mr-1" /> Inline Submission Result
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <CardContent className="flex-1 p-3 overflow-y-auto font-mono text-xs scrollbar-thin">
          {/* Custom Stdin Input Tab */}
          {activeConsoleTab === 'input' && (
            <div className="space-y-2 h-full flex flex-col font-sans">
              <label className="text-[11px] font-semibold text-muted-foreground">
                Custom Stdin Arguments:
              </label>
              <Textarea
                value={customInput}
                onChange={(e) => onCustomInputChange(e.target.value)}
                rows={4}
                placeholder="Enter custom input arguments..."
                className="font-mono text-xs bg-slate-950 text-slate-100 border-slate-800 flex-1"
              />
            </div>
          )}

          {/* Run Output Tab */}
          {activeConsoleTab === 'output' && (
            <div className="space-y-3 font-mono text-xs">
              {isEvaluating ? (
                <div className="flex items-center justify-center py-10 text-violet-500 gap-2">
                  <Clock className="h-5 w-5 animate-spin" />
                  <span className="font-sans font-semibold text-xs text-muted-foreground">Compiling & Executing Code...</span>
                </div>
              ) : executionResult ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-muted/40 p-2 rounded border border-border/50 font-sans">
                    <span className="font-bold text-emerald-400">Execution Complete</span>
                    <span className="text-muted-foreground text-[11px]">
                      {executionResult.executionTimeMs} ms | {executionResult.memoryMb} MB
                    </span>
                  </div>

                  {executionResult.stderr && (
                    <div className="p-3 rounded bg-rose-950/60 border border-rose-800 text-rose-300 space-y-1">
                      <p className="font-bold text-rose-400 font-sans">Error Output (Stderr):</p>
                      <pre className="whitespace-pre-wrap">{executionResult.stderr}</pre>
                    </div>
                  )}

                  {executionResult.stdout && (
                    <div className="p-3 rounded bg-slate-950 border border-slate-800 text-slate-100 space-y-1">
                      <p className="font-bold text-slate-400 font-sans">Standard Output (Stdout):</p>
                      <pre className="whitespace-pre-wrap text-emerald-400">{executionResult.stdout}</pre>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground font-sans italic text-center py-6">
                  Click Run Code to execute your draft solution against custom stdin input.
                </p>
              )}
            </div>
          )}

          {/* Inline Submission Result Tab (Zero Popups!) */}
          {activeConsoleTab === 'result' && (
            <div className="space-y-3">
              {isEvaluating ? (
                <div className="flex items-center justify-center py-10 text-violet-500 gap-2">
                  <Clock className="h-5 w-5 animate-spin" />
                  <span className="font-sans font-semibold text-xs text-muted-foreground">Evaluating Submission Against 20+ Hidden Test Cases...</span>
                </div>
              ) : submissionResult ? (
                <div className="space-y-3 font-mono text-xs">
                  {/* Verdict & Metrics Row */}
                  <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      {getVerdictBadge(submissionResult.verdict)}
                      <span className="text-slate-300 font-bold">
                        Passed {submissionResult.passedCases} / {submissionResult.totalCases} Hidden Cases
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                      <span>Time: {submissionResult.executionTimeMs} ms</span>
                      <span>Memory: {submissionResult.memoryMb} MB</span>
                    </div>
                  </div>

                  {/* Inline Graph Placeholders */}
                  <GraphPlaceholders
                    runtimeMs={submissionResult.executionTimeMs}
                    memoryMb={submissionResult.memoryMb}
                    averageRuntimeMs={problem.averageRuntimeMs || 42}
                    averageMemoryMb={problem.averageMemoryMb || 14.5}
                  />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground font-sans italic text-center py-6">
                  Click Submit Solution to evaluate against 20+ hidden test cases and view inline metrics & graphs.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
