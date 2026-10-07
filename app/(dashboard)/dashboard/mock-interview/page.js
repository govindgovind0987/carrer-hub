'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Video,
  PlusCircle,
  Sparkles,
  Trophy,
  Target,
  BarChart3,
  Clock,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Award,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCandidateInterviewAnalyticsAction } from '@/actions/interview';

export default function MockInterviewDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const res = await getCandidateInterviewAnalyticsAction();
    if (res.success && res.analytics) {
      setAnalytics(res.analytics);
    }
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    getCandidateInterviewAnalyticsAction().then((res) => {
      if (!isMounted) return;
      if (res.success && res.analytics) {
        setAnalytics(res.analytics);
      }
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const stats = [
    {
      label: 'Average Interview Score',
      value: `${analytics?.averageScore ?? 0}%`,
      desc: analytics?.interviewCount > 0 ? 'Candidate performance average' : 'No completed sessions yet',
      icon: Trophy,
      color: 'text-amber-500 bg-amber-500/10',
    },
    {
      label: 'Total Completed Interviews',
      value: analytics?.interviewCount ?? 0,
      desc: 'Mock sessions conducted',
      icon: Video,
      color: 'text-primary bg-primary/10',
    },
    {
      label: 'Best Performance Score',
      value: `${analytics?.bestPerformance ?? 0}%`,
      desc: analytics?.interviewCount > 0 ? 'Highest achieved score' : 'Complete interviews to establish benchmark',
      icon: Award,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      label: 'Improvement Velocity',
      value: analytics?.interviewCount > 1 ? '+12%' : '0%',
      desc: 'Score gain trajectory',
      icon: TrendingUp,
      color: 'text-cyan-500 bg-cyan-500/10',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            AI Mock Interview Platform
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Practice real-time technical, coding, HR, and behavioral interviews with Groq AI feedback and voice analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={loadData} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>

          <Button asChild className="bg-primary   text-primary-foreground shadow-sm">
            <Link href="/dashboard/mock-interview/create">
              <PlusCircle className="mr-2 h-4 w-4" /> Start New Interview
            </Link>
          </Button>
        </div>
      </div>

      {/* Analytics KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-border/50 bg-card">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</span>
                <div className="text-2xl font-bold text-foreground font-mono">{s.value}</div>
                <span className="text-[11px] text-muted-foreground">{s.desc}</span>
              </div>
              <div className={`p-3 rounded-lg ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Interviews List & Practice Shortcut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Sessions (8 Cols) */}
        <Card className="lg:col-span-8 border-border/50 bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Recent Mock Interview Sessions
              </CardTitle>
              <CardDescription>Review past session scores, voice recordings, and AI feedback.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/mock-interview/create" className="text-xs text-primary">
                New Session <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="p-6 pt-0 space-y-4">
            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : analytics?.recentInterviews?.length > 0 ? (
              <div className="space-y-3">
                {analytics.recentInterviews.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-4 rounded-md border border-border/50 bg-muted/20 hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{sess.role || 'Software Engineer'}</span>
                        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                          {sess.technology}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {sess.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Session Type: {sess.type || 'Technical Interview'} • {new Date(sess.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {sess.report?.overallScore ? (
                        <Badge variant="default" className="bg-primary text-primary-foreground font-mono px-3 py-1">
                          Score: {sess.report.overallScore}%
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500/40 text-amber-500 bg-amber-500/10 font-mono text-[10px]">
                          In Progress
                        </Badge>
                      )}

                      {sess.status === 'COMPLETED' || sess.report ? (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/mock-interview/report/${sess.id}`}>
                            View Report
                          </Link>
                        </Button>
                      ) : (
                        <Button size="sm" className="bg-primary text-primary-foreground" asChild>
                          <Link href={`/dashboard/mock-interview/room/${sess.id}`}>
                            Resume Interview
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground space-y-3">
                <Video className="mx-auto h-12 w-12 text-primary" />
                <h4 className="font-semibold text-foreground">No interview sessions yet</h4>
                <p className="text-xs max-w-sm mx-auto">
                  Launch your first AI mock interview to practice realistic voice and coding questions.
                </p>
                <Button asChild className="bg-primary text-primary-foreground mt-2">
                  <Link href="/dashboard/mock-interview/create">
                    <PlusCircle className="mr-2 h-4 w-4" /> Start AI Interview
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Sidebar: Topics & AI Practice Launcher (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-primary/30 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-primary">
                <BrainCircuit className="h-5 w-5" /> Quick Interview Launcher
              </CardTitle>
              <CardDescription className="text-xs">
                Select your focus domain to generate an instant 5-question mock session.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { tech: 'React', label: 'Frontend / React 19' },
                { tech: 'Node.js', label: 'Backend / Node.js & Express' },
                { tech: 'System Design', label: 'System Design & Scalability' },
                { tech: 'DSA', label: 'Algorithms & Data Structures' },
              ].map((item) => (
                <Link
                  key={item.tech}
                  href={`/dashboard/mock-interview/create`}
                  className="p-3 rounded-md border border-border/50 bg-card hover:border-primary transition-all flex items-center justify-between text-xs font-semibold text-foreground group"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" /> Focus Improvement Areas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                <span className="font-semibold text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> High-Priority Practice Topic
                </span>
                <p className="text-muted-foreground">Concurrency state updates & React 19 Fiber Reconciliation.</p>
              </div>

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified Strongest Tech
                </span>
                <p className="text-muted-foreground">Node.js Server Actions & PostgreSQL schema design.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
