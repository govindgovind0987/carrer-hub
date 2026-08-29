'use client';

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Maximize2,
  Minimize2,
  Copy,
  Check,
  RotateCcw,
  Sun,
  Moon,
  Type,
  WrapText,
  Code2,
} from 'lucide-react';
import { toast } from 'sonner';

export function MonacoCodeEditor({
  value,
  onChange,
  language = 'python',
  onRun,
  onSubmit,
  isEvaluating = false,
  readOnly = false,
}) {
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState('on');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Map language aliases for Monaco
  const getMonacoLanguage = (lang) => {
    const l = (lang || 'python').toLowerCase();
    if (l === 'py') return 'python';
    if (l === 'c++') return 'cpp';
    if (l === 'java') return 'java';
    return l;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditorMount = (editor, monaco) => {
    // Add custom keyboard shortcuts
    // Ctrl+Enter or Cmd+Enter -> Run Code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRun && !isEvaluating) onRun();
    });

    // Ctrl+Shift+Enter or Cmd+Shift+Enter -> Submit Solution
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
      () => {
        if (onSubmit && !isEvaluating) onSubmit();
      }
    );
  };

  return (
    <div
      className={`flex flex-col border border-border/60 rounded-xl overflow-hidden bg-slate-950 shadow-lg transition-all duration-200 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-full min-h-[450px]'
      }`}
    >
      {/* Editor Control Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 gap-2">
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="bg-violet-500/10 text-violet-400 border-violet-500/30 text-xs font-mono uppercase px-2.5 py-0.5"
          >
            {language}
          </Badge>
          <span className="text-[11px] text-slate-400 hidden sm:inline-block font-mono">
            Ctrl+Enter: Run | Ctrl+Shift+Enter: Submit
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5">
          {/* Font Size Selector */}
          <div className="flex items-center gap-1 bg-slate-800/60 rounded-lg px-2 py-1 text-slate-300">
            <Type className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="bg-transparent text-xs border-none focus:outline-none cursor-pointer text-slate-200"
            >
              {[12, 13, 14, 16, 18, 20].map((sz) => (
                <option key={sz} value={sz} className="bg-slate-900 text-slate-200">
                  {sz}px
                </option>
              ))}
            </select>
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
            className="h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            title="Toggle Theme"
          >
            {theme === 'vs-dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </Button>

          {/* Word Wrap Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWordWrap(wordWrap === 'on' ? 'off' : 'on')}
            className={`h-8 w-8 hover:bg-slate-800 ${
              wordWrap === 'on' ? 'text-violet-400' : 'text-slate-400'
            }`}
            title="Toggle Word Wrap"
          >
            <WrapText className="h-3.5 w-3.5" />
          </Button>

          {/* Copy Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            title="Copy Code"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>

          {/* Fullscreen Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* Monaco Editor Core Container */}
      <div className="flex-1 w-full relative">
        <Editor
          height="100%"
          language={getMonacoLanguage(language)}
          theme={theme}
          value={value}
          onChange={(val) => onChange(val || '')}
          onMount={handleEditorMount}
          options={{
            readOnly,
            fontSize,
            wordWrap,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            formatOnType: true,
            formatOnPaste: true,
            bracketPairColorization: { enabled: true },
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            lineNumbersMinChars: 3,
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </div>
  );
}
