'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Target,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  FileText,
  Loader2,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getResumes } from '@/actions/resume';
import { getJobs } from '@/actions/job';
import { runJobMatchAction } from '@/actions/ai';

export default function JobMatchPage() {
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getResumes(), getJobs({ limit: 20 })]).then(([resData, jobsData]) => {
      if (!isMounted) return;
      if (resData.success && resData.resumes.length > 0) {
        setResumes(resData.resumes);
        setSelectedResumeId(resData.resumes[0].id);
      }
      if (jobsData.success && jobsData.jobs.length > 0) {
        setJobs(jobsData.jobs);
        setSelectedJobId(jobsData.jobs[0].id);
      }
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRunMatch = async () => {
    if (!selectedResumeId || !selectedJobId) {
      toast.error('Please select both a resume and a target job position');
      return;
    }

    setMatching(true);
    try {
      const res = await runJobMatchAction(selectedResumeId, selectedJobId);
      if (res.success) {
        toast.success('AI Job Match completed!');
        setMatchResult(res.jobMatch);
      } else {
        toast.error(res.error || 'Failed to match job');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setMatching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Job Matcher</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compare your tailored resume directly against target job description requisitions to calculate match probability.
        </p>
      </div>

      {/* Selectors Card */}
      <Card className="border-border/50 bg-card p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-end">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Resume</label>
            <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose resume..." />
              </SelectTrigger>
              <SelectContent>
                {resumes.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Target Job Requisition</label>
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose job position..." />
              </SelectTrigger>
              <SelectContent>
                {jobs.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No job positions available
                  </SelectItem>
                ) : (
                  jobs.map((j) => (
                    <SelectItem key={j.id} value={j.id}>
                      {j.title}{j.company?.name ? ` (${j.company.name})` : ''}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleRunMatch}
            disabled={matching || !selectedResumeId || !selectedJobId}
            size="sm"
            className="h-9 font-semibold"
          >
            {matching ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Zap className="mr-2 h-3.5 w-3.5" />} Calculate Match
          </Button>
        </div>
      </Card>

      {/* Results */}
      {!matchResult ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Target className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-base font-semibold text-foreground">Calculate Job Compatibility</h3>
            <p className="text-xs mt-1 max-w-md mx-auto">
              Select a resume and job position above to generate your customized compatibility matrix and missing skill report.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Match Score Banner */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">Position: {matchResult.jobTitle}</Badge>
                  <Badge variant={matchResult.matchScore >= 75 ? 'success' : matchResult.matchScore >= 50 ? 'warning' : 'destructive'}>
                    {matchResult.matchScore >= 75 ? 'Strong Match' : matchResult.matchScore >= 50 ? 'Moderate Match' : 'Low Match'}
                  </Badge>
                </div>
                <h2 className="text-xl font-bold text-foreground">Match Compatibility Index</h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
                  {matchResult.recommendation}
                </p>
              </div>

              <div className="flex h-20 w-20 flex-col items-center justify-center rounded-lg border border-border bg-muted/40 text-foreground shrink-0">
                <span className="text-2xl font-bold">{matchResult.matchScore}%</span>
                <span className="text-[9px] uppercase font-semibold text-muted-foreground">Score</span>
              </div>
            </div>
          </Card>

          {/* Missing vs Recommended Skills */}
          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-foreground">Missing Key Skills</CardTitle>
                <CardDescription className="text-xs">Skills required by job requisition not detected on your resume</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {matchResult.missingSkills?.map((skill, idx) => (
                  <Badge key={idx} variant="warning" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-foreground">Recommended Skills to Add</CardTitle>
                <CardDescription className="text-xs">High-converting keywords to include in your project descriptions</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {matchResult.recommendedSkills?.map((skill, idx) => (
                  <Badge key={idx} variant="success" className="text-xs">
                    + {skill}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Tailoring Suggestions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-foreground" /> Actionable Resume Tailoring Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {matchResult.suggestions?.map((sug, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground bg-muted/30 p-3 rounded-md border border-border">
                  <ArrowRight className="h-3.5 w-3.5 text-foreground mt-0.5 shrink-0" />
                  <span>{sug}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
