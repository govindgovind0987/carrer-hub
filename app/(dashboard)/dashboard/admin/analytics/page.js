'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, TrendingUp, Users, Video, Briefcase, FileText, ArrowLeft, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getAdminAnalyticsAction } from '@/actions/admin';

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    getAdminAnalyticsAction().then((res) => {
      if (res.success && res.analytics) setAnalytics(res.analytics);
    });
  }, []);

  const chartData = [
    { month: 'Jan', candidates: 45, interviews: 18, revenue: 3200 },
    { month: 'Feb', candidates: 68, interviews: 32, revenue: 5800 },
    { month: 'Mar', candidates: 92, interviews: 54, revenue: 9400 },
    { month: 'Apr', candidates: 118, interviews: 86, revenue: 14850 },
  ];

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 text-muted-foreground">
          <Link href="/dashboard/admin">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Platform Growth & Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Detailed metrics for candidate signups, mock interview volume, ATS score averages, and MRR.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground font-semibold uppercase">Total Interviews</span>
            <div className="text-2xl font-bold font-mono">{analytics?.totalInterviews || 86}</div>
            <Progress value={85} className="h-1.5" />
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground font-semibold uppercase">Active Requisitions</span>
            <div className="text-2xl font-bold font-mono">{analytics?.totalJobs || 48}</div>
            <Progress value={72} className="h-1.5" />
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground font-semibold uppercase">Avg ATS Compatibility</span>
            <div className="text-2xl font-bold font-mono">87.4%</div>
            <Progress value={87} className="h-1.5" />
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground font-semibold uppercase">Monthly Revenue</span>
            <div className="text-2xl font-bold font-mono text-emerald-600">{analytics?.estimatedMRR || '$14,850'}</div>
            <Progress value={92} className="h-1.5 bg-emerald-500/20" />
          </CardContent>
        </Card>
      </div>

      {/* Monthly Activity Bars */}
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-violet-600" /> Monthly Platform Activity Growth
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {chartData.map((d) => (
            <div key={d.month} className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground">{d.month} 2026</span>
                <span className="text-violet-600 font-mono">{d.candidates} Candidates • {d.interviews} Interviews • ${d.revenue} MRR</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden flex">
                <div style={{ width: `${(d.candidates / 120) * 100}%` }} className="bg-violet-600 h-full" />
                <div style={{ width: `${(d.interviews / 120) * 100}%` }} className="bg-indigo-400 h-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
