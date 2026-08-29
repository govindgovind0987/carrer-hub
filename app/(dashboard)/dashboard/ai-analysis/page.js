'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Bot,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  TrendingUp,
  Loader2,
  ListChecks,
  ShieldCheck,
  Zap,
  Award,
  AlertCircle,
  ChevronRight,
  Info,
  Layers,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getResumes } from '@/actions/resume';
import { runResumeAnalysisAction, getAIReportsAction } from '@/actions/ai';

const CATEGORY_MAX_POINTS = {
  ats: 15,
  contact: 5,
  summary: 10,
  skills: 15,
  experience: 20,
  projects: 15,
  education: 5,
  achievements: 5,
  keywords: 5,
  formatting: 5,
};

const CATEGORY_NAMES = {
  ats: 'ATS Compatibility',
  contact: 'Contact Information',
  summary: 'Professional Summary',
  skills: 'Technical Skills',
  experience: 'Work Experience',
  projects: 'Projects & Demos',
  education: 'Education',
  achievements: 'Achievements & Certifications',
  keywords: 'Keywords & Job Relevance',
  formatting: 'Formatting & Readability',
};

export default function AIAnalysisPage() {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getResumes(), getAIReportsAction()]).then(([resData, aiData]) => {
      if (!isMounted) return;
      if (resData.success && resData.resumes.length > 0) {
        setResumes(resData.resumes);
        const defaultRes = resData.resumes.find((r) => r.isDefault) || resData.resumes[0];
        setSelectedResumeId(defaultRes.id);
      }
      if (aiData.success && aiData.latestAnalysis) {
        setAnalysis(aiData.latestAnalysis);
      }
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRunAnalysis = async () => {
    if (!selectedResumeId) {
      toast.error('Please upload or select a resume first');
      return;
    }

    setAnalyzing(true);
    try {
      const res = await runResumeAnalysisAction(selectedResumeId);
      if (res.success) {
        toast.success('Multi-Dimensional AI Resume analysis completed!');
        setAnalysis(res.analysis);
      } else {
        toast.error(res.error || 'Failed to complete AI analysis');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setAnalyzing(false);
    }
  };

  const categoryScores = analysis?.keywordAnalysis?.categoryScores || {
    ats: 12,
    contact: 4,
    summary: 7,
    skills: 12,
    experience: 15,
    projects: 11,
    education: 4,
    achievements: 3,
    keywords: 4,
    formatting: 4,
  };

  const categoryExplanations = analysis?.keywordAnalysis?.categoryExplanations || {};
  const priorityImprovements = analysis?.keywordAnalysis?.priorityImprovements || [];
  const qualityLevel = analysis?.keywordAnalysis?.qualityLevel || (analysis?.overallScore >= 80 ? 'Excellent' : 'Strong');
  const baseScore = analysis?.keywordAnalysis?.baseScore ?? analysis?.overallScore;
  const aiAdjustment = analysis?.keywordAnalysis?.aiAdjustment ?? 0;

  const getQualityBadgeColor = (level) => {
    switch (level) {
      case 'Outstanding':
      case 'Excellent':
        return 'success';
      case 'Strong':
      case 'Good':
        return 'secondary';
      case 'Needs Improvement':
        return 'warning';
      case 'Weak':
      default:
        return 'destructive';
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border border-border bg-card p-6 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              AI Resume Score & ATS Audit
            </h1>
            <Badge variant="secondary" className="text-[10px]">10 Categories</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            Deterministic scoring across 10 measurable categories combined with Groq AI qualitative audit.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {resumes.length > 0 && (
            <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
              <SelectTrigger className="w-44 h-9 text-xs">
                <SelectValue placeholder="Select Resume" />
              </SelectTrigger>
              <SelectContent>
                {resumes.map((r) => (
                  <SelectItem key={r.id} value={r.id} className="text-xs">
                    {r.title} {r.isDefault ? '(Default)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            onClick={handleRunAnalysis}
            disabled={analyzing || resumes.length === 0}
            size="sm"
          >
            {analyzing ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Zap className="mr-2 h-3.5 w-3.5" />} Run AI Audit
          </Button>
        </div>
      </div>

      {!analysis ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Bot className="mx-auto h-14 w-14 text-violet-600 mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-foreground">No AI Analysis Report Found</h3>
            <p className="text-sm max-w-md mx-auto mt-1">
              Select your resume above and click &quot;Run AI Audit&quot; to generate your detailed 10-category ATS compatibility report.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Top Score Summary Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-card to-background relative overflow-hidden">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Overall Score</p>
                    <Badge className={getQualityBadgeColor(qualityLevel)}>{qualityLevel}</Badge>
                  </div>
                  <p className="mt-1 text-4xl font-extrabold tracking-tight text-violet-600">
                    {analysis.overallScore} <span className="text-lg font-normal text-muted-foreground">/ 100</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                    <span>Base: {baseScore}/100</span>
                    <span>•</span>
                    <span className={aiAdjustment >= 0 ? 'text-emerald-500 font-semibold' : 'text-rose-500 font-semibold'}>
                      AI Adjustment: {aiAdjustment >= 0 ? `+${aiAdjustment}` : aiAdjustment}
                    </span>
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-white font-bold shadow-lg shrink-0">
                  <Bot className="h-7 w-7" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 via-card to-background">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ATS Compatibility</p>
                  <p className="mt-1 text-4xl font-extrabold tracking-tight text-indigo-600">{analysis.atsScore}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Section & heading parseability</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shrink-0">
                  <ShieldCheck className="h-7 w-7" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-card to-background">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Interview Readiness</p>
                  <p className="mt-1 text-3xl font-extrabold tracking-tight text-emerald-600">{analysis.interviewReadiness || 'High'}</p>
                  <p className="text-xs text-muted-foreground mt-1">Market technical competitiveness</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold shadow-lg shrink-0">
                  <TrendingUp className="h-7 w-7" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 10-Category Score Breakdown Grid */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Layers className="h-5 w-5 text-violet-600" /> Multi-Dimensional Category Score Breakdown
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Deterministic score evaluated across 10 distinct quality dimensions (Total Base = 100 points).
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs border-violet-500/30 text-violet-600">
                  Total Base: {baseScore}/100
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {Object.entries(CATEGORY_NAMES).map(([key, name]) => {
                  const score = categoryScores[key] ?? 0;
                  const max = CATEGORY_MAX_POINTS[key];
                  const pct = Math.round((score / max) * 100);
                  const explanation = categoryExplanations[key] || '';

                  return (
                    <div key={key} className="p-3.5 rounded-xl border border-border/50 bg-card/60 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-foreground">{name}</span>
                        <span className="text-violet-600">
                          {score} / {max} pts
                        </span>
                      </div>
                      <Progress value={pct} className="h-2" />
                      {explanation && (
                        <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1">
                          <Info className="h-3 w-3 text-violet-500 shrink-0 mt-0.5" />
                          <span>{explanation}</span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* AI Executive Summary */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-600" /> AI Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground bg-muted/30 p-4 rounded-xl border border-border/40">
                {analysis.summary}
              </p>
            </CardContent>
          </Card>

          {/* Priority Improvements */}
          {priorityImprovements.length > 0 && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-5 w-5" /> Recommended Priority Improvements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {priorityImprovements.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-card border border-amber-500/20 flex items-start gap-3 text-xs">
                    <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-600 shrink-0">
                      {item.priority} Priority
                    </Badge>
                    <div>
                      <span className="font-bold text-foreground">{item.category}: </span>
                      <span className="text-muted-foreground">{item.suggestion}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Strengths & Weaknesses Split */}
          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="border-emerald-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" /> Top Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysis.strongAreas?.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-amber-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-5 w-5" /> Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysis.weakAreas?.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground bg-amber-500/5 p-3 rounded-lg border border-amber-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Missing High-Value Skills */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-violet-600" /> High-Value Missing Keywords & Skills
              </CardTitle>
              <CardDescription className="text-xs">Adding these keywords to your resume increases ATS parser matching rate.</CardDescription>
            </CardHeader>
            <CardContent>
              {analysis.missingSkills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills.map((skill, idx) => (
                    <Badge key={idx} variant="outline" className="px-3 py-1 text-xs border-violet-500/30 text-violet-600 bg-violet-500/5">
                      + {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">All high-value core technical keywords detected.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
