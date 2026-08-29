'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Bot,
  BrainCircuit,
  TrendingUp,
  FileText,
  Code2,
  Video,
  AlertCircle,
  Loader2,
  ArrowRight,
  Target,
  Compass,
  Calendar,
  Zap,
  CheckCircle2,
  Clock,
  Layers,
  Award,
  BookOpen,
  ShieldAlert,
  ListCheck,
  Lightbulb,
  Check,
  ChevronRight,
  Star,
  FileCheck,
  Flame,
  GraduationCap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function CareerCoachClient({ initialContext }) {
  const [loading, setLoading] = useState(false);
  const [activeActionId, setActiveActionId] = useState('analyze-skills');
  const [activeActionLabel, setActiveActionLabel] = useState('Analyze My Skills');
  const [aiResponse, setAiResponse] = useState(null);

  const actionButtons = [
    { id: 'analyze-skills', label: 'Analyze My Skills', icon: BrainCircuit, color: 'text-violet-500' },
    { id: 'learning-roadmap', label: 'Create My Learning Roadmap', icon: Compass, color: 'text-indigo-500' },
    { id: 'learn-next', label: 'What Should I Learn Next?', icon: Target, color: 'text-emerald-500' },
    { id: 'weak-areas', label: 'Find My Weak Areas', icon: AlertCircle, color: 'text-rose-500' },
    { id: 'interview-prep', label: 'Prepare Me for Interviews', icon: Video, color: 'text-purple-500' },
    { id: 'improve-resume', label: 'Improve My Resume', icon: FileText, color: 'text-cyan-500' },
    { id: 'technical-skills', label: 'Improve My Technical Skills', icon: Code2, color: 'text-amber-500' },
    { id: '30-day-plan', label: 'Create 30-Day Plan', icon: Calendar, color: 'text-blue-500' },
    { id: '90-day-plan', label: 'Create 90-Day Plan', icon: Calendar, color: 'text-emerald-500' },
  ];

  const handleRunAiAction = async (btn) => {
    setActiveActionId(btn.id);
    setActiveActionLabel(btn.label);
    setLoading(true);
    setAiResponse(null); // Reset response to prevent stale data
    try {
      const res = await fetch('/api/career-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType: btn.id }),
      });
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      setAiResponse(data);
    } catch (err) {
      console.error('Error fetching AI advice:', err);
    } finally {
      setLoading(false);
    }
  };

  const actionCategories = [
    {
      title: 'Skill Audit & Diagnostics',
      actions: [
        { id: 'analyze-skills', label: 'Analyze My Skills', icon: BrainCircuit, purpose: 'Full skill matrix & gap analysis' },
        { id: 'weak-areas', label: 'Find My Weak Areas', icon: AlertCircle, purpose: 'Severity matrix & empirical evidence' },
        { id: 'learn-next', label: 'What Should I Learn Next?', icon: Target, purpose: 'Highest ROI skill recommendation' },
      ],
    },
    {
      title: 'Learning & Growth Roadmaps',
      actions: [
        { id: 'learning-roadmap', label: 'Create My Learning Roadmap', icon: Compass, purpose: 'Multi-phase structured learning path' },
        { id: '30-day-plan', label: 'Create 30-Day Plan', icon: Calendar, purpose: 'Short-term tactical action plan' },
        { id: '90-day-plan', label: 'Create 90-Day Plan', icon: Calendar, purpose: 'Long-term strategic execution plan' },
      ],
    },
    {
      title: 'Interview & Resume Strategy',
      actions: [
        { id: 'interview-prep', label: 'Prepare Me for Interviews', icon: Video, purpose: 'Technical, DSA & STAR questions' },
        { id: 'improve-resume', label: 'Improve My Resume', icon: FileText, purpose: 'ATS keyword & metric bullet rewrites' },
        { id: 'technical-skills', label: 'Improve My Technical Skills', icon: Code2, purpose: 'Deep stack elevation roadmap' },
      ],
    },
  ];

  const allActionButtons = actionCategories.flatMap((c) => c.actions);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-card p-6 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">AI Career Coach</h1>
            <Badge variant="secondary" className="text-[10px]">Groq Engine</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Your private AI career strategy engine. Evaluates your profile, resume ATS score, DSA progress, and interview readiness to build actionable preparation roadmaps.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={() => handleRunAiAction(allActionButtons[0])}
            disabled={loading}
            size="sm"
          >
            {loading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Bot className="mr-2 h-3.5 w-3.5" />}
            Analyze My Career Fit
          </Button>
        </div>
      </div>

      {/* Readiness Scores Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Card className="sm:col-span-2 lg:col-span-2">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Overall Readiness Score</span>
              <Sparkles className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {initialContext.careerReadinessScore}<span className="text-sm font-normal text-muted-foreground">/100</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Career Readiness Index</p>
            </div>
            <Progress value={initialContext.careerReadinessScore} className="h-1.5" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">Resume</span>
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{initialContext.resumeReadiness}%</p>
              <Progress value={initialContext.resumeReadiness} className="h-1.5 mt-1.5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">Technical</span>
              <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{initialContext.technicalReadiness}%</p>
              <Progress value={initialContext.technicalReadiness} className="h-1.5 mt-1.5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">DSA Progress</span>
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{initialContext.dsaReadiness}%</p>
              <Progress value={initialContext.dsaReadiness} className="h-1.5 mt-1.5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">Interview</span>
              <Video className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{initialContext.interviewReadiness}%</p>
              <Progress value={initialContext.interviewReadiness} className="h-1.5 mt-1.5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categorized Interactive Action Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-foreground" /> AI Coach Strategy Actions
          </CardTitle>
          <CardDescription className="text-xs">
            Select a strategy action to evaluate your candidate record and generate tailored recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {actionCategories.map((cat, catIdx) => (
              <div key={catIdx} className="space-y-2">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">
                  {cat.title}
                </h4>
                <div className="space-y-1.5">
                  {cat.actions.map((btn) => {
                    const Icon = btn.icon;
                    const isActive = activeActionId === btn.id;
                    return (
                      <button
                        key={btn.id}
                        disabled={loading}
                        onClick={() => handleRunAiAction(btn)}
                        className={`w-full text-left p-2.5 rounded-md border transition-all cursor-pointer ${
                          isActive
                            ? 'border-primary bg-secondary text-foreground font-semibold shadow-2xs ring-1 ring-primary'
                            : 'border-border/60 bg-card hover:bg-accent/60 hover:border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className="text-xs">{btn.label}</span>
                          </div>
                          {isActive && (
                            <Badge variant="default" className="text-[9px] h-4 px-1">Selected</Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 pl-5 line-clamp-1">{btn.purpose}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Response Display Area */}
      <Card className="min-h-[300px]">
        <CardHeader className="border-b border-border py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-4.5 w-4.5 text-foreground" />
              <CardTitle className="text-base">
                AI Insight: <span className="text-foreground">{activeActionLabel}</span>
              </CardTitle>
            </div>
            {loading && (
              <Badge variant="outline" className="animate-pulse text-xs">
                <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Querying Groq AI...
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
              <p className="text-sm font-medium text-foreground">Analyzing candidate profile, ATS scores, and DSA activity...</p>
              <p className="text-xs text-muted-foreground">Constructing action-specific strategy for &quot;{activeActionLabel}&quot;.</p>
            </div>
          ) : aiResponse ? (
            <div className="space-y-6">
              {/* Summary Callout */}
              {aiResponse.summary && (
                <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4">
                  <p className="text-sm text-foreground leading-relaxed font-medium">{aiResponse.summary}</p>
                </div>
              )}

              {/* DYNAMIC VIEW 1: ANALYZE SKILLS */}
              {(aiResponse.actionType === 'analyze-skills' || activeActionId === 'analyze-skills') && (
                <div className="space-y-6">
                  {aiResponse.overallAssessment && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <BrainCircuit className="h-4 w-4 text-violet-500" /> Overall Skill Assessment
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed p-3 rounded-lg bg-card border border-border/40">
                        {aiResponse.overallAssessment}
                      </p>
                    </div>
                  )}

                  {aiResponse.strongSkills?.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Verified Strong Skills
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {aiResponse.strongSkills.map((sk, idx) => (
                          <div key={idx} className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs text-foreground">{sk.name}</span>
                              <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] border-0">
                                {sk.depth || 'Verified'}
                              </Badge>
                            </div>
                            {sk.evidence && <p className="text-[11px] text-muted-foreground">{sk.evidence}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiResponse.skillsNeedingImprovement?.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4 text-amber-500" /> Skills Needing Improvement
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {aiResponse.skillsNeedingImprovement.map((sk, idx) => (
                          <div key={idx} className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-foreground">{sk.name}</span>
                              <span className="text-[10px] text-amber-600 font-semibold">{sk.currentLevel || 'Beginner'} → {sk.targetLevel || 'Intermediate'}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">{sk.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiResponse.missingSkills?.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Target className="h-4 w-4 text-rose-500" /> Missing / Underdeveloped Stack Gaps
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {aiResponse.missingSkills.map((m, idx) => (
                          <Badge key={idx} variant="outline" className="border-rose-500/30 text-rose-600 py-1 px-2.5 text-xs">
                            <span className="font-bold">{typeof m === 'string' ? m : m.name}</span>
                            {m.category && <span className="ml-1 text-[10px] text-muted-foreground">({m.category})</span>}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiResponse.priorityRecommendations?.length > 0 && (
                    <div className="space-y-2 border-t border-border/50 pt-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <ListCheck className="h-4 w-4 text-violet-600" /> Priority Skill Recommendations
                      </h3>
                      <ul className="space-y-1.5 text-xs">
                        {aiResponse.priorityRecommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-card border border-border/40">
                            <Check className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiResponse.suggestedNextActions?.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Suggested Next Actions</h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {aiResponse.suggestedNextActions.map((act, idx) => (
                          <div key={idx} className="p-3 rounded-xl border border-border/50 bg-card flex flex-col justify-between">
                            <div>
                              <h4 className="font-bold text-xs text-foreground">{act.title}</h4>
                              <p className="text-[11px] text-muted-foreground mt-1">{act.description}</p>
                            </div>
                            {act.targetRoute && (
                              <Button asChild size="sm" variant="ghost" className="mt-2 text-xs text-violet-600 justify-start p-0 h-auto font-semibold">
                                <Link href={act.targetRoute}>
                                  Execute <ArrowRight className="ml-1 h-3 w-3" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* DYNAMIC VIEW 2: LEARNING ROADMAP */}
              {(aiResponse.actionType === 'learning-roadmap' || activeActionId === 'learning-roadmap') && (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Current Level</span>
                      <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{aiResponse.currentLevel || 'Software Developer'}</p>
                    </div>
                    <div className="border-l border-indigo-500/30 pl-4">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Target Role</span>
                      <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{aiResponse.targetRole || 'Senior Software Engineer'}</p>
                    </div>
                  </div>

                  {aiResponse.learningPriorities?.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Flame className="h-4 w-4 text-amber-500" /> Key Learning Priorities
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {aiResponse.learningPriorities.map((p, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiResponse.phases?.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Compass className="h-4 w-4 text-indigo-500" /> Multi-Phase Structured Roadmap
                      </h3>
                      <div className="space-y-4">
                        {aiResponse.phases.map((ph, idx) => (
                          <div key={idx} className="p-4 rounded-xl border border-indigo-500/20 bg-card space-y-3">
                            <div className="flex items-center justify-between border-b border-border/50 pb-2">
                              <span className="font-extrabold text-sm text-indigo-600">{ph.phase}</span>
                              {ph.milestone && (
                                <Badge variant="outline" className="text-[10px] border-indigo-500/30 text-indigo-600">
                                  Milestone: {ph.milestone}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs font-medium text-foreground">{ph.focus}</p>
                            {ph.technologies?.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[11px] font-bold text-muted-foreground">Tech Stack:</span>
                                {ph.technologies.map((t, tIdx) => (
                                  <Badge key={tIdx} variant="outline" className="text-[10px]">{t}</Badge>
                                ))}
                              </div>
                            )}
                            {ph.practiceProjects?.length > 0 && (
                              <div className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/40">
                                <span className="font-bold text-foreground">Practice Project:</span> {ph.practiceProjects.join(', ')}
                              </div>
                            )}
                            {ph.expectedOutcome && (
                              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> Expected Outcome: {ph.expectedOutcome}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiResponse.recommendedSequence?.length > 0 && (
                    <div className="space-y-2 border-t border-border/50 pt-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recommended Execution Sequence</h3>
                      <ol className="space-y-1 text-xs text-muted-foreground">
                        {aiResponse.recommendedSequence.map((step, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="h-5 w-5 rounded-full bg-indigo-500/10 text-indigo-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}

              {/* DYNAMIC VIEW 3: WHAT SHOULD I LEARN NEXT */}
              {(aiResponse.actionType === 'learn-next' || activeActionId === 'learn-next') && (
                <div className="space-y-6">
                  {aiResponse.learnThisFirst && (
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-card to-background border border-emerald-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-emerald-500 text-white border-0 text-xs font-bold">
                          Learn This First (Highest Impact)
                        </Badge>
                        {aiResponse.learnThisFirst.estimatedHoursOrDays && (
                          <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 text-xs">
                            <Clock className="mr-1 h-3 w-3" /> {aiResponse.learnThisFirst.estimatedHoursOrDays}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-2xl font-extrabold text-foreground">{aiResponse.learnThisFirst.skill}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">{aiResponse.learnThisFirst.why}</p>
                      {aiResponse.learnThisFirst.prerequisites?.length > 0 && (
                        <div className="flex items-center gap-2 pt-2 border-t border-emerald-500/20 text-xs">
                          <span className="font-bold text-muted-foreground">Prerequisites:</span>
                          {aiResponse.learnThisFirst.prerequisites.map((p, pIdx) => (
                            <Badge key={pIdx} variant="secondary" className="text-[10px]">{p}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {aiResponse.nextSkills?.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Target className="h-4 w-4 text-emerald-500" /> Subsequent 3–5 Priority Skills
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {aiResponse.nextSkills.map((sk, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl border border-border/50 bg-card space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-foreground">{sk.skill}</span>
                              <Badge className={sk.priority === 'High' ? 'bg-rose-500/10 text-rose-600 border-rose-500/30 text-[10px]' : 'bg-blue-500/10 text-blue-600 border-blue-500/30 text-[10px]'}>
                                {sk.priority} Priority
                              </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">{sk.whyItMatters}</p>
                            {sk.category && <span className="text-[10px] text-violet-600 font-semibold block">{sk.category}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiResponse.practiceRecommendation && (
                    <div className="p-4 rounded-xl border border-border/50 bg-card space-y-1.5">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-violet-600" /> Practice Recommendation
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{aiResponse.practiceRecommendation}</p>
                    </div>
                  )}
                </div>
              )}

              {/* DYNAMIC VIEW 4: WEAK AREAS */}
              {(aiResponse.actionType === 'weak-areas' || activeActionId === 'weak-areas') && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-rose-500" /> Identified Weak Areas & Severity Matrix
                  </h3>
                  <div className="space-y-4">
                    {aiResponse.weaknesses?.map((w, idx) => {
                      const isHigh = w.severity === 'High';
                      const isMed = w.severity === 'Medium';
                      return (
                        <div key={idx} className={`p-4 rounded-xl border space-y-2.5 ${isHigh ? 'border-rose-500/30 bg-rose-500/5' : isMed ? 'border-amber-500/30 bg-amber-500/5' : 'border-blue-500/30 bg-blue-500/5'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge className={`text-[10px] font-bold border-0 ${isHigh ? 'bg-rose-600 text-white' : isMed ? 'bg-amber-600 text-white' : 'bg-blue-600 text-white'}`}>
                                Priority #{w.priority || idx + 1}
                              </Badge>
                              <h4 className="font-extrabold text-sm text-foreground">{w.area}</h4>
                            </div>
                            <Badge variant="outline" className={`text-[10px] font-bold ${isHigh ? 'border-rose-500 text-rose-600' : isMed ? 'border-amber-500 text-amber-600' : 'border-blue-500 text-blue-600'}`}>
                              {w.severity} Severity
                            </Badge>
                          </div>
                          {w.evidence && (
                            <div className="p-2.5 rounded-lg bg-card border border-border/40 text-xs">
                              <span className="font-bold text-muted-foreground">Empirical Evidence:</span> <span className="text-foreground">{w.evidence}</span>
                            </div>
                          )}
                          <div className="grid gap-2 sm:grid-cols-2 text-xs">
                            <div>
                              <span className="font-bold text-muted-foreground block text-[11px]">Why It Matters:</span>
                              <p className="text-muted-foreground">{w.whyItMatters}</p>
                            </div>
                            <div>
                              <span className="font-bold text-emerald-600 block text-[11px]">How To Improve:</span>
                              <p className="text-foreground font-medium">{w.howToImprove}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* DYNAMIC VIEW 5: PREPARE ME FOR INTERVIEWS */}
              {(aiResponse.actionType === 'interview-prep' || activeActionId === 'interview-prep') && (
                <div className="space-y-6">
                  {aiResponse.technicalTopics?.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Code2 className="h-4 w-4 text-purple-500" /> Core Technical Interview Topics
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {aiResponse.technicalTopics.map((top, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/5 space-y-2">
                            <h4 className="font-bold text-xs text-purple-700 dark:text-purple-300">{top.topic}</h4>
                            {top.keyConcepts?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {top.keyConcepts.map((kc, kIdx) => (
                                  <Badge key={kIdx} variant="outline" className="text-[9px] bg-card">{kc}</Badge>
                                ))}
                              </div>
                            )}
                            {top.sampleQuestion && (
                              <p className="text-[11px] text-muted-foreground italic bg-card p-2 rounded border border-border/40">
                                &quot;{top.sampleQuestion}&quot;
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiResponse.dsaTopics?.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4 text-indigo-500" /> High-Yield DSA Patterns
                      </h3>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {aiResponse.dsaTopics.map((dsa, idx) => (
                          <div key={idx} className="p-3 rounded-lg border border-border/50 bg-card flex items-center justify-between">
                            <div>
                              <span className="font-bold text-xs text-foreground block">{dsa.pattern}</span>
                              <span className="text-[10px] text-muted-foreground">{dsa.focusArea}</span>
                            </div>
                            <Badge variant="secondary" className="text-[10px]">Target: {dsa.targetCount || 5} problems</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiResponse.projectQuestions?.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Layers className="h-4 w-4 text-amber-500" /> Likely Project Deep-Dive Questions
                      </h3>
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        {aiResponse.projectQuestions.map((q, idx) => (
                          <li key={idx} className="p-2.5 rounded-lg bg-card border border-border/40 flex items-start gap-2">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiResponse.resumeQuestions?.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-cyan-500" /> Resume Experience Questions
                      </h3>
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        {aiResponse.resumeQuestions.map((q, idx) => (
                          <li key={idx} className="p-2.5 rounded-lg bg-card border border-border/40 flex items-start gap-2">
                            <span className="text-cyan-500 font-bold">•</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiResponse.hrBehavioralQuestions?.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Bot className="h-4 w-4 text-emerald-500" /> HR & Behavioral STAR Questions
                      </h3>
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        {aiResponse.hrBehavioralQuestions.map((q, idx) => (
                          <li key={idx} className="p-2.5 rounded-lg bg-card border border-border/40 flex items-start gap-2">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiResponse.preparationStrategy?.length > 0 && (
                    <div className="space-y-3 border-t border-border/50 pt-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Actionable Preparation Strategy</h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {aiResponse.preparationStrategy.map((st, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl border border-border/50 bg-card flex flex-col justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-purple-600">Step {st.step || idx + 1}</span>
                              <h4 className="font-bold text-xs text-foreground mt-0.5">{st.title}</h4>
                              <p className="text-[11px] text-muted-foreground mt-1">{st.description}</p>
                            </div>
                            {st.targetRoute && (
                              <Button asChild size="sm" variant="ghost" className="mt-3 text-xs text-purple-600 justify-start p-0 h-auto font-semibold">
                                <Link href={st.targetRoute}>
                                  Launch Practice <ArrowRight className="ml-1 h-3 w-3" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* DYNAMIC VIEW 6: IMPROVE MY RESUME */}
              {(aiResponse.actionType === 'improve-resume' || activeActionId === 'improve-resume') && (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {aiResponse.resumeStrengths?.length > 0 && (
                      <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
                        <h4 className="font-bold text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" /> Resume Strengths
                        </h4>
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          {aiResponse.resumeStrengths.map((str, idx) => (
                            <li key={idx}>• {str}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {aiResponse.resumeProblems?.length > 0 && (
                      <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-2">
                        <h4 className="font-bold text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                          <AlertCircle className="h-4 w-4" /> Areas to Fix
                        </h4>
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          {aiResponse.resumeProblems.map((prob, idx) => (
                            <li key={idx}>• {prob}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {aiResponse.missingKeywords?.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Target className="h-4 w-4 text-cyan-500" /> High-Value Missing Keywords
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {aiResponse.missingKeywords.map((kw, idx) => (
                          <Badge key={idx} variant="outline" className="border-cyan-500/30 text-cyan-600 py-1 px-2.5 text-xs">
                            + {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiResponse.experienceImprovements?.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <FileCheck className="h-4 w-4 text-violet-600" /> Experience Bullet Point Rewrites
                      </h3>
                      <div className="space-y-3">
                        {aiResponse.experienceImprovements.map((exp, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl border border-border/50 bg-card space-y-2 text-xs">
                            <div className="text-rose-600 font-medium">
                              <span className="font-bold text-[10px] uppercase block text-muted-foreground">Current Issue:</span>
                              {exp.currentIssue}
                            </div>
                            <div className="text-emerald-600 font-medium bg-emerald-500/5 p-2 rounded border border-emerald-500/20">
                              <span className="font-bold text-[10px] uppercase block text-emerald-700 dark:text-emerald-300">Quantified Rewrite:</span>
                              {exp.bulletImprovement}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiResponse.projectImprovements?.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Code2 className="h-4 w-4 text-indigo-500" /> Project Description Enhancements
                      </h3>
                      <div className="space-y-3">
                        {aiResponse.projectImprovements.map((prj, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl border border-border/50 bg-card space-y-2 text-xs">
                            <div className="text-amber-600 font-medium">
                              <span className="font-bold text-[10px] uppercase block text-muted-foreground">Gap:</span>
                              {prj.currentIssue}
                            </div>
                            <div className="text-indigo-600 font-medium bg-indigo-500/5 p-2 rounded border border-indigo-500/20">
                              <span className="font-bold text-[10px] uppercase block text-indigo-700 dark:text-indigo-300">Recommended Format:</span>
                              {prj.bulletImprovement}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiResponse.priorityFixes?.length > 0 && (
                    <div className="space-y-2 border-t border-border/50 pt-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Immediate Priority Fixes</h3>
                      <ol className="space-y-1 text-xs text-muted-foreground">
                        {aiResponse.priorityFixes.map((fix, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="text-cyan-600 font-bold">{idx + 1}.</span>
                            <span>{fix}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}

              {/* DYNAMIC VIEW 7: IMPROVE MY TECHNICAL SKILLS */}
              {(aiResponse.actionType === 'technical-skills' || activeActionId === 'technical-skills') && (
                <div className="space-y-6">
                  {aiResponse.currentTechnicalLevel && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Current Technical Level</span>
                        <p className="text-base font-extrabold text-amber-700 dark:text-amber-300">{aiResponse.currentTechnicalLevel}</p>
                      </div>
                      <Code2 className="h-6 w-6 text-amber-500" />
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    {aiResponse.strongTechnicalAreas?.length > 0 && (
                      <div className="p-4 rounded-xl border border-emerald-500/20 bg-card space-y-2">
                        <h4 className="font-bold text-xs text-emerald-600 flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" /> Strong Technical Areas
                        </h4>
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          {aiResponse.strongTechnicalAreas.map((sta, idx) => (
                            <li key={idx}>• {sta}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {aiResponse.weakTechnicalAreas?.length > 0 && (
                      <div className="p-4 rounded-xl border border-rose-500/20 bg-card space-y-2">
                        <h4 className="font-bold text-xs text-rose-600 flex items-center gap-1.5">
                          <AlertCircle className="h-4 w-4" /> Technical Gaps
                        </h4>
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          {aiResponse.weakTechnicalAreas.map((wta, idx) => (
                            <li key={idx}>• {wta}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {aiResponse.recommendedTechnologies?.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Zap className="h-4 w-4 text-amber-500" /> High-Impact Recommended Technologies
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {aiResponse.recommendedTechnologies.map((rec, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl border border-border/50 bg-card space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-foreground">{rec.tech}</span>
                              {rec.impact && <Badge variant="secondary" className="text-[9px]">{rec.impact}</Badge>}
                            </div>
                            <p className="text-[11px] text-muted-foreground">{rec.purpose}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiResponse.projectRecommendations?.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Layers className="h-4 w-4 text-violet-600" /> Recommended Practice Projects
                      </h3>
                      <div className="space-y-3">
                        {aiResponse.projectRecommendations.map((prj, idx) => (
                          <div key={idx} className="p-4 rounded-xl border border-violet-500/20 bg-violet-500/5 space-y-2">
                            <h4 className="font-bold text-xs text-foreground">{prj.title}</h4>
                            <p className="text-xs text-muted-foreground">{prj.description}</p>
                            {prj.stack?.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {prj.stack.map((st, sIdx) => (
                                  <Badge key={sIdx} variant="outline" className="text-[9px] bg-card">{st}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiResponse.technicalMilestones?.length > 0 && (
                    <div className="space-y-2 border-t border-border/50 pt-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Technical Milestones</h3>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {aiResponse.technicalMilestones.map((ms, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-amber-500 shrink-0" />
                            <span>{ms}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* DYNAMIC VIEW 8: CREATE 30-DAY PLAN */}
              {(aiResponse.actionType === '30-day-plan' || activeActionId === '30-day-plan') && (
                <div className="space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-blue-500" /> 30-Day Preparation Schedule (Weekly Breakdown)
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {aiResponse.periods?.map((p, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold uppercase text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded">
                              {p.range}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-xs text-foreground">{p.title}</h4>
                          {p.tasks?.length > 0 && (
                            <ul className="space-y-1 text-[11px] text-muted-foreground">
                              {p.tasks.map((task, tIdx) => (
                                <li key={tIdx} className="flex items-start gap-1.5">
                                  <span className="text-blue-600 font-bold">•</span>
                                  <span>{task}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        {p.measurableGoal && (
                          <div className="p-2 rounded bg-card border border-border/40 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                            Goal: {p.measurableGoal}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DYNAMIC VIEW 9: CREATE 90-DAY PLAN */}
              {(aiResponse.actionType === '90-day-plan' || activeActionId === '90-day-plan') && (
                <div className="space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-emerald-500" /> 90-Day Strategic Job-Readiness Roadmap
                  </h3>
                  <div className="space-y-4">
                    {aiResponse.periods?.map((p, idx) => (
                      <div key={idx} className="p-5 rounded-xl border border-emerald-500/20 bg-card space-y-3">
                        <div className="flex items-center justify-between border-b border-border/50 pb-2">
                          <span className="text-xs font-mono font-bold text-emerald-600 uppercase">{p.range}</span>
                          <h4 className="font-extrabold text-sm text-foreground">{p.title}</h4>
                        </div>
                        {p.focus && <p className="text-xs text-muted-foreground italic">{p.focus}</p>}
                        
                        <div className="grid gap-3 sm:grid-cols-2 text-xs">
                          {p.technicalDevelopment?.length > 0 && (
                            <div>
                              <span className="font-bold text-foreground block text-[11px]">Technical Focus:</span>
                              <ul className="space-y-0.5 text-muted-foreground text-[11px]">
                                {p.technicalDevelopment.map((td, tdIdx) => (
                                  <li key={tdIdx}>• {td}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {p.dsaFocus && (
                            <div>
                              <span className="font-bold text-foreground block text-[11px]">DSA & Problem Solving:</span>
                              <p className="text-muted-foreground text-[11px]">{p.dsaFocus}</p>
                            </div>
                          )}
                        </div>

                        {p.jobReadinessMilestones?.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border/40">
                            <span className="text-[10px] font-bold text-muted-foreground">Milestones:</span>
                            {p.jobReadinessMilestones.map((m, mIdx) => (
                              <Badge key={mIdx} variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px]">
                                {m}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="py-8 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Click any of the action buttons above to run instant AI career analysis on your profile and DSA submissions.
              </p>
              <Button
                onClick={() => handleRunAiAction(actionButtons[0])}
                className="bg-violet-600 hover:bg-violet-700 text-white text-xs"
              >
                Analyze My Skills Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

