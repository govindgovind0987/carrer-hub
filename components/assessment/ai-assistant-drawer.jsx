'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Bot,
  Bug,
  Zap,
  Lightbulb,
  BookOpen,
  GitBranch,
  Loader2,
  HelpCircle,
  Cpu,
  Clock,
  AlertCircle,
  SlidersHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';

export function AIAssistantDrawer({ code, language, problemTitle, problemDescription }) {
  const [activeMode, setActiveMode] = useState('review_code');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const AI_MODES = [
    { id: 'explain_problem', label: 'Explain Problem', icon: BookOpen },
    { id: 'explain_constraints', label: 'Explain Constraints', icon: AlertCircle },
    { id: 'generate_hint', label: 'Generate Hint', icon: Lightbulb },
    { id: 'explain_wrong_answer', label: 'Explain Wrong Answer', icon: Bug },
    { id: 'review_code', label: 'Review My Code', icon: Bot },
    { id: 'optimize_code', label: 'Optimize My Code', icon: SlidersHorizontal },
    { id: 'explain_time_complexity', label: 'Explain Time Complexity', icon: Clock },
    { id: 'explain_space_complexity', label: 'Explain Space Complexity', icon: Cpu },
    { id: 'alternative_solution', label: 'Alternative Solution', icon: GitBranch },
    { id: 'dry_run', label: 'Generate Dry Run', icon: Zap },
    { id: 'visualization', label: 'Generate Visualization', icon: Sparkles },
  ];

  const fetchAIAnalysis = async (mode) => {
    setLoading(true);
    try {
      const res = await fetch('/api/assessment/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code || '# No draft code',
          language,
          mode,
          problemTitle,
          problemDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate AI response');

      setAiResult({ mode, content: data.result });
      toast.success('AI Insights ready!');
    } catch (err) {
      toast.error(err.message || 'AI Assistant unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-xl shadow-xl flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-border/50 bg-violet-500/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-500 animate-pulse" />
          <h3 className="font-bold text-base bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Groq AI Copilot
          </h3>
        </div>
        <Badge variant="outline" className="border-violet-500/30 text-violet-600 text-[10px]">
          Llama 3.3 70B
        </Badge>
      </div>

      {/* Grid of 9 AI Action Buttons */}
      <div className="p-3 border-b border-border/40 bg-muted/20 overflow-y-auto max-h-48 scrollbar-thin">
        <div className="grid grid-cols-2 gap-1.5">
          {AI_MODES.map((m) => {
            const Icon = m.icon;
            const isSelected = activeMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setActiveMode(m.id);
                  fetchAIAnalysis(m.id);
                }}
                className={`p-2 rounded-lg text-[11px] font-medium flex items-center gap-1.5 text-left transition-all ${
                  isSelected
                    ? 'bg-violet-600 text-white font-bold shadow'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-violet-500 gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="font-sans font-semibold text-xs text-muted-foreground">
              Generating Groq AI Insights for {activeMode.replace(/_/g, ' ')}...
            </span>
          </div>
        ) : aiResult && aiResult.mode === activeMode ? (
          <div className="space-y-3 pt-2 text-xs leading-relaxed whitespace-pre-line text-foreground/90 bg-muted/30 p-4 rounded-xl border border-border/50 font-sans">
            {aiResult.content}
          </div>
        ) : (
          <div className="text-center py-12 space-y-3 text-muted-foreground">
            <HelpCircle className="h-10 w-10 mx-auto text-violet-400/50" />
            <p className="text-xs max-w-xs mx-auto">
              Select any of the 9 AI copilot modes above to receive instant explanations, hints, bug analysis, time/space complexity, or optimization advice!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

