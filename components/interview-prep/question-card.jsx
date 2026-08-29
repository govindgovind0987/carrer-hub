'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Copy,
  Share2,
  Download,
  Bookmark,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  FileText,
  HelpCircle,
  Loader2,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

export function QuestionCard({
  question,
  index,
  totalCount,
  onRefresh,
  onGenerateSimilar,
  onExplain,
  onSimplify,
  onMakeHarder,
  onMakeEasier,
  onToggleBookmark,
}) {
  const [isExpanded, setIsExpanded] = useState(index === 0);
  const [activeTab, setActiveTab] = useState('expected');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(question.bookmarked || false);
  const [copied, setCopied] = useState(false);

  // Dynamic AI Transformation loading states
  const [loadingAction, setLoadingAction] = useState(null);
  const [aiExplanation, setAiExplanation] = useState(question.explanation || null);
  const [aiSimplified, setAiSimplified] = useState(null);
  const [similarQuestions, setSimilarQuestions] = useState(null);

  // Speech Synthesis
  const handleToggleVoice = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.error('Voice Reading is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      toast.info('Voice playback stopped.');
    } else {
      const textToSpeak = `Question ${index + 1}: ${question.question}. Expected Answer: ${
        question.bestAnswer || question.sampleAnswer
      }`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      toast.success('Reading question and answer aloud...');
    }
  };

  const handleCopy = () => {
    const fullText = `Question: ${question.question}\n\nExpected Answer: ${
      question.bestAnswer || question.sampleAnswer
    }\n\nKey Points:\n${(question.keyPoints || []).join('\n')}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success('Question and answer copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: question.question,
        text: `Interview Question: ${question.question}\nCategory: ${question.categoryName || question.category}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Session link copied to clipboard!');
    }
  };

  const handleDownloadPDF = () => {
    const content = `CareerHub Interview Question\nQuestion: ${question.question}\nCategory: ${
      question.categoryName || question.category
    }\nDifficulty: ${question.difficulty}\n\nEXPECTED ANSWER:\n${
      question.sampleAnswer || ''
    }\n\nBEST ANSWER:\n${question.bestAnswer || ''}\n\nEXPLANATION:\n${
      question.explanation || ''
    }\n\nCOMMON MISTAKES:\n${(question.commonMistakes || []).join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-question-${index + 1}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Question document downloaded!');
  };

  const handleDownloadDocx = () => {
    const markdownContent = `# Question ${index + 1}: ${question.question}
**Role**: ${question.role || 'Software Engineer'} | **Category**: ${question.categoryName || question.category} | **Difficulty**: ${question.difficulty}

## Expected Answer
${question.sampleAnswer || question.bestAnswer || ''}

## Detailed Explanation
${question.explanation || ''}

## Best Enterprise Answer
${question.bestAnswer || ''}

## Common Mistakes
${(question.commonMistakes || []).map((m) => `- ${m}`).join('\n')}

## Real Interview Tips
${(question.interviewTips || []).map((t) => `- ${t}`).join('\n')}
`;
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-question-${index + 1}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Markdown document downloaded!');
  };

  const handleBookmarkToggle = () => {
    const nextVal = !isBookmarked;
    setIsBookmarked(nextVal);
    if (onToggleBookmark) onToggleBookmark(question.id, nextVal);
    toast.success(nextVal ? 'Question bookmarked!' : 'Bookmark removed');
  };

  // AI Actions Trigger Handlers
  const handleExplainAI = async () => {
    setLoadingAction('explain');
    try {
      if (onExplain) {
        const result = await onExplain(question.question, question.sampleAnswer || question.bestAnswer);
        setAiExplanation(result);
        setActiveTab('explanation');
        toast.success('AI Explanation generated!');
      }
    } catch (_) {
      toast.error('Failed to generate AI explanation');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSimplifyAI = async () => {
    setLoadingAction('simplify');
    try {
      if (onSimplify) {
        const result = await onSimplify(question.question, question.sampleAnswer || question.bestAnswer);
        setAiSimplified(result);
        setActiveTab('simplified');
        toast.success('Simplified ELI5 answer generated!');
      }
    } catch (_) {
      toast.error('Failed to simplify answer');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSimilarAI = async () => {
    setLoadingAction('similar');
    try {
      if (onGenerateSimilar) {
        const list = await onGenerateSimilar(
          question.question,
          question.categoryName || question.category,
          question.difficulty,
          question.role
        );
        setSimilarQuestions(list);
        setActiveTab('similar');
        toast.success('Generated 3 similar interview questions!');
      }
    } catch (_) {
      toast.error('Failed to generate similar questions');
    } finally {
      setLoadingAction(null);
    }
  };

  const getDifficultyBadge = (diff) => {
    const d = (diff || 'MEDIUM').toUpperCase();
    if (d === 'EASY')
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Easy</Badge>;
    if (d === 'MEDIUM')
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">Medium</Badge>;
    if (d === 'EXPERT')
      return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/30">Expert</Badge>;
    return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/30">Hard</Badge>;
  };

  return (
    <Card className="border-border/60 bg-card/90 backdrop-blur-xl overflow-hidden transition-all shadow-md hover:border-violet-500/30">
      {/* Top Question Header */}
      <CardHeader
        className="p-5 flex flex-row items-start justify-between cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="space-y-2 pr-4 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-violet-600 border-violet-500/30 text-xs font-bold">
              Q{index + 1} of {totalCount}
            </Badge>
            {getDifficultyBadge(question.difficulty)}
            <Badge variant="secondary" className="text-xs">
              {question.categoryName || question.category || 'Technical'}
            </Badge>
            {question.companyStyle && (
              <Badge variant="outline" className="text-[11px] text-muted-foreground">
                {question.companyStyle}
              </Badge>
            )}
          </div>
          <CardTitle className="text-base sm:text-lg font-bold tracking-tight leading-snug pt-1 text-foreground">
            {question.question}
          </CardTitle>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleBookmarkToggle();
            }}
            className="h-8 w-8 text-muted-foreground hover:text-amber-500"
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
          </Button>

          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-5 pt-0 space-y-5 border-t border-border/40">
          {/* Main Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-4 bg-muted/20 p-3 rounded-xl border border-border/40">
            {/* AI Magic Transformations */}
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={handleExplainAI}
                disabled={loadingAction === 'explain'}
                className="text-xs bg-violet-500/10 text-violet-600 border-violet-500/30 hover:bg-violet-500/20"
              >
                {loadingAction === 'explain' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                ) : (
                  <BookOpen className="h-3.5 w-3.5 mr-1" />
                )}
                Explain Answer
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleSimplifyAI}
                disabled={loadingAction === 'simplify'}
                className="text-xs bg-indigo-500/10 text-indigo-600 border-indigo-500/30 hover:bg-indigo-500/20"
              >
                {loadingAction === 'simplify' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                ) : (
                  <Lightbulb className="h-3.5 w-3.5 mr-1" />
                )}
                Simplify (ELI5)
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleSimilarAI}
                disabled={loadingAction === 'similar'}
                className="text-xs border-border/60 hover:bg-muted"
              >
                {loadingAction === 'similar' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 mr-1 text-violet-500" />
                )}
                Similar Questions
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => onMakeHarder && onMakeHarder(question.id)}
                className="text-xs text-rose-600 hover:bg-rose-500/10"
              >
                <TrendingUp className="h-3.5 w-3.5 mr-1" /> Make Harder
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => onMakeEasier && onMakeEasier(question.id)}
                className="text-xs text-emerald-600 hover:bg-emerald-500/10"
              >
                <TrendingDown className="h-3.5 w-3.5 mr-1" /> Make Easier
              </Button>
            </div>

            {/* Utilities: Voice, Copy, Share, Download */}
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant={isSpeaking ? 'default' : 'ghost'}
                onClick={handleToggleVoice}
                className="h-8 w-8 text-violet-600"
                title="Voice Reading Aloud"
              >
                {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={handleCopy}
                className="h-8 w-8 text-muted-foreground"
                title="Copy Question & Answer"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={handleShare}
                className="h-8 w-8 text-muted-foreground"
                title="Share Question"
              >
                <Share2 className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={handleDownloadPDF}
                className="h-8 w-8 text-muted-foreground"
                title="Download Document"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Question Details Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/60 p-1 rounded-xl">
              <TabsTrigger value="expected" className="text-xs py-1 px-3">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-500" /> Expected Answer
              </TabsTrigger>
              <TabsTrigger value="explanation" className="text-xs py-1 px-3">
                <FileText className="h-3.5 w-3.5 mr-1 text-violet-500" /> Detailed Explanation
              </TabsTrigger>
              <TabsTrigger value="best" className="text-xs py-1 px-3">
                <Sparkles className="h-3.5 w-3.5 mr-1 text-indigo-500" /> Model Answer
              </TabsTrigger>
              <TabsTrigger value="alternative" className="text-xs py-1 px-3">
                <HelpCircle className="h-3.5 w-3.5 mr-1 text-cyan-500" /> Alternative Approach
              </TabsTrigger>
              <TabsTrigger value="mistakes" className="text-xs py-1 px-3">
                <AlertTriangle className="h-3.5 w-3.5 mr-1 text-rose-500" /> Common Mistakes
              </TabsTrigger>
              <TabsTrigger value="tips" className="text-xs py-1 px-3">
                <Lightbulb className="h-3.5 w-3.5 mr-1 text-amber-500" /> Interview Tips
              </TabsTrigger>
            </TabsList>

            {/* 1. Expected Answer Tab */}
            <TabsContent value="expected" className="pt-4 space-y-3">
              <div className="p-4 rounded-xl bg-card border border-border/50 text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                {question.sampleAnswer || 'No expected answer available.'}
              </div>
              {question.keyPoints && question.keyPoints.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Key Talking Points:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {question.keyPoints.map((kp, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-muted/40 font-mono">
                        <CheckCircle2 className="mr-1.5 h-3 w-3 text-emerald-500" /> {kp}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* 2. Detailed Explanation Tab */}
            <TabsContent value="explanation" className="pt-4 space-y-3">
              <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20 text-sm leading-relaxed whitespace-pre-line text-foreground">
                {aiExplanation || question.explanation || question.sampleAnswer || 'Detailed technical breakdown.'}
              </div>
            </TabsContent>

            {/* 3. Best Enterprise Answer Tab */}
            <TabsContent value="best" className="pt-4 space-y-3">
              <div className="p-4 rounded-xl bg-slate-950 text-slate-100 border border-slate-800 text-sm leading-relaxed font-mono whitespace-pre-line">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs text-violet-400 font-sans font-bold">
                  <span>Enterprise Candidate Model Standard:</span>
                </div>
                {question.bestAnswer || question.sampleAnswer}
              </div>
            </TabsContent>

            {/* 4. Alternative Answer Tab */}
            <TabsContent value="alternative" className="pt-4 space-y-3">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                {question.alternativeAnswer || 'Alternative architectural pattern or trade-off evaluation.'}
              </div>
            </TabsContent>

            {/* 5. Common Mistakes Tab */}
            <TabsContent value="mistakes" className="pt-4 space-y-3">
              <div className="space-y-2">
                {question.commonMistakes && question.commonMistakes.length > 0 ? (
                  question.commonMistakes.map((mst, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2"
                    >
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{mst}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No common pitfalls recorded for this topic.</p>
                )}
              </div>
            </TabsContent>

            {/* 6. Real Interview Tips Tab */}
            <TabsContent value="tips" className="pt-4 space-y-3">
              <div className="space-y-2">
                {question.interviewTips && question.interviewTips.length > 0 ? (
                  question.interviewTips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 flex items-start gap-2"
                    >
                      <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">Focus on structured communication and clear trade-offs.</p>
                )}
              </div>
            </TabsContent>

            {/* Simplified Answer View (Triggered by AI) */}
            {activeTab === 'simplified' && (
              <div className="pt-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm leading-relaxed text-indigo-700 dark:text-indigo-300">
                <h5 className="font-bold text-xs uppercase tracking-wider mb-2">ELI5 Simplified Version:</h5>
                {aiSimplified || 'Generating simplified version...'}
              </div>
            )}

            {/* Similar Questions View (Triggered by AI) */}
            {activeTab === 'similar' && (
              <div className="pt-4 space-y-3">
                <h5 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  3 AI-Generated Similar Questions:
                </h5>
                {similarQuestions && similarQuestions.length > 0 ? (
                  similarQuestions.map((sq, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-muted/40 border border-border/50 space-y-2 text-xs">
                      <p className="font-bold text-foreground">
                        {idx + 1}. {sq.question}
                      </p>
                      <p className="text-muted-foreground">{sq.sampleAnswer}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">Loading similar questions...</p>
                )}
              </div>
            )}
          </Tabs>

          {/* Follow-up question banner */}
          {question.followUp && (
            <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs space-y-1">
              <span className="font-bold text-violet-600 dark:text-violet-400">Likely Follow-Up Question:</span>
              <p className="text-foreground/90">{question.followUp}</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
