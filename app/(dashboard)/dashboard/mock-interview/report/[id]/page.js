'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Trophy,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowLeft,
  Share2,
  Download,
  Sparkles,
  Target,
  BrainCircuit,
  TrendingUp,
  Award,
  Zap,
  HelpCircle,
  Code2,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { generateFinalInterviewReportAction } from '@/actions/interview';

export default function InterviewReportPage({ params: propsParams }) {
  const router = useRouter();
  const routerParams = useParams();
  const resolvedParams = propsParams && typeof propsParams.then === 'function' ? use(propsParams) : propsParams;
  const sessionId = routerParams?.id || routerParams?.sessionId || resolvedParams?.id || resolvedParams?.sessionId;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedQIndex, setExpandedQIndex] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadReport() {
      if (!sessionId) {
        if (isMounted) {
          setError('Session ID parameter is missing.');
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);
      const res = await generateFinalInterviewReportAction(sessionId);
      if (res.success && res.report) {
        if (isMounted) setReport(res.report);
      } else {
        if (isMounted) {
          setError(res.error || 'Failed to generate or retrieve interview report.');
        }
      }
      if (isMounted) setLoading(false);
    }

    loadReport();
    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Synthesizing AI Evaluation & Report Analytics...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-lg mx-auto text-center space-y-4 p-6">
        <div className="h-16 w-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-2">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Interview Report Unavailable</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {error || 'The requested interview report could not be found or you do not have permission to view it.'}
        </p>
        <div className="flex items-center gap-3 pt-4">
          <Button variant="outline" onClick={() => router.push('/dashboard/mock-interview')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> All Interviews
          </Button>
          <Button onClick={() => router.push('/dashboard/mock-interview/create')} className="bg-primary text-primary-foreground">
            <Sparkles className="mr-2 h-4 w-4" /> Start New Interview
          </Button>
        </div>
      </div>
    );
  }

  const scoreMetrics = [
    { label: 'Technical Score', score: report?.technicalScore ?? 0 },
    { label: 'Coding Score', score: report?.codingScore ?? 0 },
    { label: 'Problem Solving', score: report?.problemSolvingScore ?? 0 },
    { label: 'Communication', score: report?.communicationScore ?? 0 },
    { label: 'Confidence Score', score: report?.confidenceScore ?? 0 },
    { label: 'Behavioral Score', score: report?.behaviorScore ?? 0 },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/mock-interview')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Interviews Dashboard
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" /> Export Report PDF
          </Button>
        </div>
      </div>

      {/* Top Banner Card: Overall Score & Recommendation */}
      <Card className="border-border/50 bg-card shadow-sm overflow-hidden relative">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Score Ring / Badge (4 cols) */}
            <div className="md:col-span-4 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-border/50 pb-6 md:pb-0 md:pr-6">
              <div className="relative flex items-center justify-center w-36 h-36 rounded-full bg-primary p-1.5 shadow-sm">
                <div className="w-full h-full rounded-full bg-card flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-foreground">
                    {report?.overallScore ?? 0}%
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">
                    Overall Score
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="mt-4 border-primary/30 text-primary bg-primary/10 font-bold px-3 py-1">
                Enterprise AI Verified
              </Badge>
            </div>

            {/* Recommendation & Summary (8 cols) */}
            <div className="md:col-span-8 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Award className="h-4 w-4" /> AI Hiring Recommendation
                  </span>
                  {report?.interviewReadiness && (
                    <Badge variant="secondary" className="text-[11px] font-semibold">
                      {report.interviewReadiness}
                    </Badge>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  {report?.recommendation || (report?.overallScore >= 70 ? 'RECOMMENDED FOR HIRE' : 'NEEDS PREPARATION')}
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground bg-card/60 p-4 rounded-md border border-border/40">
                {report?.summary}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 9-Parameter Score Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {scoreMetrics.map((m) => (
          <Card key={m.label} className="border-border/50 bg-card">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                <span>{m.label}</span>
                <span className="font-bold text-foreground font-mono">{m.score}%</span>
              </div>
              <Progress value={m.score} className="h-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs: Breakdown, Strengths/Weaknesses, Learning Plan */}
      <Tabs defaultValue="breakdown" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/60 p-1">
          <TabsTrigger value="breakdown">Question Breakdown</TabsTrigger>
          <TabsTrigger value="insights">Strengths & Weaknesses</TabsTrigger>
          <TabsTrigger value="plan">Tailored Learning Plan</TabsTrigger>
        </TabsList>

        {/* Tab 1: Question Breakdown */}
        <TabsContent value="breakdown" className="space-y-4 pt-4">
          {(report?.questionBreakdown || []).map((q, idx) => {
            const isExpanded = expandedQIndex === idx;
            return (
              <Card key={idx} className="border-border/50 bg-card overflow-hidden">
                <CardHeader
                  className="p-5 flex flex-row items-start justify-between cursor-pointer hover:bg-accent/40 transition-colors"
                  onClick={() => setExpandedQIndex(isExpanded ? null : idx)}
                >
                  <div className="space-y-1.5 pr-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                        Q{q.questionOrder || idx + 1}
                      </Badge>
                      {q.verdict && (
                        <Badge
                          className={`text-[10px] font-bold ${
                            q.verdict === 'CORRECT'
                              ? 'bg-emerald-600 text-white'
                              : q.verdict === 'PARTIALLY_CORRECT'
                              ? 'bg-amber-600 text-white'
                              : q.verdict === 'NOT_ANSWERED'
                              ? 'bg-muted text-muted-foreground border border-border'
                              : 'bg-rose-600 text-white'
                          }`}
                        >
                          {q.verdict === 'CORRECT'
                            ? 'Correct'
                            : q.verdict === 'PARTIALLY_CORRECT'
                            ? 'Partially Correct'
                            : q.verdict === 'NOT_ANSWERED'
                            ? 'Not Answered'
                            : 'Incorrect'}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        Score: {q.score}%
                      </Badge>
                    </div>
                    <h3 className="text-sm font-bold text-foreground leading-snug">{q.question}</h3>
                  </div>

                  <Button variant="ghost" size="icon" className="shrink-0">
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </Button>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="p-6 pt-0 space-y-4 border-t border-border/40 bg-muted/20">
                    <div className="space-y-2 pt-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Candidate Answer</h4>
                      <p className="text-xs font-mono bg-card p-3 rounded-lg border border-border/50 text-foreground whitespace-pre-wrap">
                        {q.answer && q.answer !== '(No answer)' && q.answer !== '(No answer provided)' && q.answer !== '(No answer recorded)'
                          ? q.answer
                          : 'No answer was provided for this question.'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" /> AI Feedback & Evaluation
                      </h4>
                      <p className="text-xs leading-relaxed text-muted-foreground bg-card p-3 rounded-lg border border-border/50">
                        {q.feedback}
                      </p>
                    </div>

                    {q.idealAnswer && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Benchmark Model Answer
                        </h4>
                        <p className="text-xs leading-relaxed text-muted-foreground bg-card p-3 rounded-lg border border-border/50">
                          {q.idealAnswer}
                        </p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </TabsContent>

        {/* Tab 2: Insights (Strengths, Weaknesses, Mistakes, Missing Concepts) */}
        <TabsContent value="insights" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card className="border-emerald-500/30 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-emerald-600 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" /> Key Candidate Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(report?.strengths || []).map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground p-2 rounded-lg bg-emerald-500/5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{s}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card className="border-amber-500/30 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-amber-600 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" /> Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(report?.weaknesses || []).map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground p-2 rounded-lg bg-amber-500/5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{w}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Missing Concepts Box */}
          {report?.missingConcepts?.length > 0 && (
            <Card className="border-border/50 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" /> Missing Concepts to Review
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {report.missingConcepts.map((mc, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs bg-muted/30">
                    {mc}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab 3: Tailored Learning Plan */}
        <TabsContent value="plan" className="space-y-6 pt-4">
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> Recommended Actionable Learning Plan
              </CardTitle>
              <CardDescription>Step-by-step roadmap to achieve top candidate performance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(report?.learningPlan || []).map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-md border border-border/40 bg-muted/20">
                  <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{item}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recommended Resources */}
          {report?.recommendedResources?.length > 0 && (
            <Card className="border-border/50 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-primary" /> Recommended Learning Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {report.recommendedResources.map((res, rIdx) => (
                  <a
                    key={rIdx}
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 rounded-md border border-border/50 bg-muted/20 hover:border-primary/50 transition-all flex items-center justify-between"
                  >
                    <div>
                      <h5 className="font-bold text-sm text-foreground">{res.title}</h5>
                      <span className="text-xs text-muted-foreground">{res.type}</span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-primary shrink-0" />
                  </a>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
