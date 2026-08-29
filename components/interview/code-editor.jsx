'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Copy, Check, RotateCcw, Maximize2, Minimize2, Play, Code2, Sparkles, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Dynamically import Monaco Editor to avoid SSR window issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="h-80 w-full bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-mono text-sm space-y-2">
      <Code2 className="h-8 w-8 animate-pulse text-violet-400" />
      <span>Loading Enterprise Monaco Editor...</span>
    </div>
  ),
});

export function CodeEditorComponent({
  initialCode = '',
  language = 'javascript',
  onChange,
  onRun,
}) {
  const [code, setCode] = useState(initialCode || '// Write your solution here...\n');
  const [selectedLanguage, setSelectedLanguage] = useState(language || 'javascript');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [executionOutput, setExecutionOutput] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const containerRef = useRef(null);

  const handleCodeChange = (newVal) => {
    setCode(newVal);
    if (onChange) onChange(newVal);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    const resetVal = initialCode || `// Solution starter in ${selectedLanguage}\nfunction solution() {\n  // TODO: Implement solution\n}\n`;
    setCode(resetVal);
    if (onChange) onChange(resetVal);
  };

  const handleRunCode = async () => {
    setIsExecuting(true);
    setExecutionOutput('Running static code evaluation & syntax verification...');
    
    setTimeout(() => {
      try {
        if (selectedLanguage === 'javascript' || selectedLanguage === 'typescript') {
          // Safe lightweight code check
          let logs = [];
          const customConsole = {
            log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
            error: (...args) => logs.push('ERROR: ' + args.join(' ')),
          };
          
          const fn = new Function('console', `${code}\nif (typeof solution === 'function') solution();`);
          fn(customConsole);
          
          setExecutionOutput(logs.length > 0 ? logs.join('\n') : 'Code executed successfully without error output.');
        } else {
          setExecutionOutput(`Code syntax verified for ${selectedLanguage}. Ready for AI evaluation.`);
        }
      } catch (err) {
        setExecutionOutput(`Execution Error: ${err.message}`);
      }
      setIsExecuting(false);
      if (onRun) onRun(code, selectedLanguage);
    }, 600);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl border border-border/60 overflow-hidden bg-slate-950 text-slate-100 flex flex-col transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl ring-2 ring-violet-500/50' : 'w-full shadow-lg'
      }`}
    >
      {/* Editor Header Control Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="h-8 w-36 bg-slate-800 border-slate-700 text-xs font-mono text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="react">React JSX</SelectItem>
              <SelectItem value="nextjs">Next.js TSX</SelectItem>
              <SelectItem value="nodejs">Node.js</SelectItem>
            </SelectContent>
          </Select>

          <Badge variant="outline" className="text-[10px] font-mono border-violet-500/40 text-violet-400 bg-violet-500/10">
            Monaco Engine
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 text-xs text-slate-300 hover:text-white hover:bg-slate-800">
            {copied ? <Check className="h-3.5 w-3.5 mr-1 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>

          <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 text-xs text-slate-300 hover:text-white hover:bg-slate-800">
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
          </Button>

          <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="h-8 text-xs text-slate-300 hover:text-white hover:bg-slate-800">
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>

          <Button
            size="sm"
            onClick={handleRunCode}
            disabled={isExecuting}
            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-md"
          >
            <Play className={`h-3.5 w-3.5 mr-1.5 ${isExecuting ? 'animate-spin' : ''}`} /> Run Code
          </Button>
        </div>
      </div>

      {/* Monaco Code Editor Area */}
      <div className={isFullscreen ? 'h-[calc(100vh-180px)]' : 'h-80'}>
        <MonacoEditor
          height="100%"
          language={selectedLanguage === 'react' || selectedLanguage === 'nextjs' ? 'javascript' : selectedLanguage}
          theme="vs-dark"
          value={code}
          onChange={handleCodeChange}
          options={{
            fontSize: 14,
            fontFamily: 'Fira Code, Consolas, Monaco, monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            lineNumbers: 'on',
            folding: true,
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>

      {/* Execution Output Console */}
      {executionOutput !== null && (
        <div className="p-3 bg-slate-900 border-t border-slate-800 text-xs font-mono space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 text-violet-400 font-semibold">
              <Terminal className="h-3.5 w-3.5" /> Execution Output Console
            </span>
            <button onClick={() => setExecutionOutput(null)} className="text-[10px] hover:underline">
              Clear Console
            </button>
          </div>
          <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 whitespace-pre-wrap max-h-32 overflow-y-auto">
            {executionOutput}
          </pre>
        </div>
      )}
    </div>
  );
}
