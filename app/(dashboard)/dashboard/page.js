import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  BookOpen,
  Code2,
  FileText,
  User,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Bot,
  Target,
  Sparkles,
  Zap,
  Video,
  Clock,
  Award,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Candidate Dashboard | CareerHub',
  description: 'AI-powered career preparation, DSA progress tracking, interview prep, and skill development portal.',
};

export default async function CandidateDashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6 text-center">
        <p className="text-muted-foreground">Please sign in to access your dashboard.</p>
      </div>
    );
  }

  // Fetch candidate authentic records
  const [
    profile,
    resumesCount,
    codingStats,
    userProgress,
    recentSubmissions,
    latestAnalysis,
    mockSessions,
    interviewReports,
    availableProblems,
  ] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId },
      include: {
        educations: true,
        experiences: true,
        skills: true,
        projects: true,
      },
    }),
    prisma.resume.count({ where: { userId } }),
    prisma.userCodingStats.findUnique({ where: { userId } }),
    prisma.userProblemProgress.findMany({
      where: { userId },
      include: { problem: true },
    }),
    prisma.problemSubmission.findMany({
      where: { userId },
      include: { problem: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.resumeAnalysis.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.interviewSession.findMany({ where: { userId } }),
    prisma.interviewReport.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    prisma.problem.count(),
  ]);

  // Profile completion score
  let profileScore = 20;
  if (profile?.headline) profileScore += 15;
  if (profile?.bio) profileScore += 15;
  if (profile?.skills?.length > 0) profileScore += 15;
  if (profile?.experiences?.length > 0) profileScore += 15;
  if (profile?.educations?.length > 0) profileScore += 10;
  if (profile?.projects?.length > 0) profileScore += 10;
  profileScore = Math.min(100, profileScore);

  // Solved counts
  const solvedProgress = userProgress.filter((p) => p.status === 'SOLVED');
  const solvedCount = codingStats?.solvedCount ?? solvedProgress.length;
  const totalPlatformProblems = availableProblems || 1;
  const dsaProgressPercentage = Math.round((solvedCount / totalPlatformProblems) * 100);

  // Readiness calculations
  const resumeReadiness = latestAnalysis?.atsScore ?? (resumesCount > 0 ? 50 : 0);
  const dsaReadiness = Math.min(100, Math.round((solvedCount / 20) * 100));
  const avgMock =
    interviewReports.length > 0
      ? Math.round(interviewReports.reduce((acc, r) => acc + r.overallScore, 0) / interviewReports.length)
      : mockSessions.length > 0
      ? 40
      : 0;
  const interviewReadiness = avgMock;

  const careerReadinessScore = Math.round(
    profileScore * 0.2 + resumeReadiness * 0.25 + dsaReadiness * 0.25 + interviewReadiness * 0.3
  );

  const stats = [
    {
      title: 'Learning Progress',
      value: `${dsaProgressPercentage}%`,
      sub: `${solvedCount} topics mastered`,
      icon: BookOpen,
    },
    {
      title: 'DSA Solved',
      value: `${solvedCount}`,
      sub: `${userProgress.length} attempted`,
      icon: Code2,
    },
    {
      title: 'Interview Score',
      value: `${interviewReadiness}%`,
      sub: `${mockSessions.length} sessions taken`,
      icon: Video,
    },
    {
      title: 'Career Readiness Index',
      value: `${careerReadinessScore}%`,
      sub: 'AI Index Score',
      icon: Sparkles,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-card p-6 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Welcome back, {session?.user?.name || 'Candidate'}
            </h1>
            <Badge variant="secondary" className="text-[10px]">Active</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Track your Data Structures & Algorithms progress, AI resume ATS evaluations, mock interview readiness, and skill development.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button asChild size="sm">
            <Link href="/dashboard/learning">
              <BookOpen className="mr-2 h-3.5 w-3.5" /> My Learning
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/career-coach">
              <Sparkles className="mr-2 h-3.5 w-3.5 text-foreground" /> AI Career Coach
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground">{stat.sub}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted/50 text-foreground shrink-0">
                <stat.icon className="h-4.5 w-4.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Primary Feature Hub Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* AI Career Coach Card */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-[10px]">Groq AI Strategy</Badge>
              <Sparkles className="h-4 w-4 text-foreground" />
            </div>
            <CardTitle className="text-base">AI Career Coach</CardTitle>
            <CardDescription className="text-xs">
              Receive AI skill audits, 30-day and 90-day learning roadmaps customized to your real performance metrics.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button asChild size="sm" className="w-full">
              <Link href="/dashboard/career-coach">
                <Zap className="mr-1.5 h-3.5 w-3.5" /> Open AI Career Coach
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Skill Progress Card */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-[10px]">Topic Analytics</Badge>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-base">Skill Progress Dashboard</CardTitle>
            <CardDescription className="text-xs">
              Track your topic mastery across all 20 DSA categories from Arrays to Graphs & Dynamic Programming.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link href="/dashboard/skill-progress">View Skill Progress</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Learning Roadmap Card */}
        <Card className="flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-[10px]">Adaptive Roadmap</Badge>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-base">Learning Roadmap</CardTitle>
            <CardDescription className="text-xs">
              Follow your structured learning sequence: Arrays → Hashing → Two Pointers → Sliding Window.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link href="/dashboard/learning">Explore Roadmap</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Profile Strength & ATS Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-foreground" /> Profile Strength
                </CardTitle>
                <CardDescription className="text-xs">
                  Complete profile entries to ensure accurate AI skill recommendations.
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm" className="h-7 text-xs">
                <Link href="/dashboard/profile">Edit Profile</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">Overall Completeness</span>
              <span className="text-foreground font-semibold">{profileScore}%</span>
            </div>
            <Progress value={profileScore} className="h-1.5" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bot className="h-4 w-4 text-foreground" /> Resume & ATS Score
                </CardTitle>
                <CardDescription className="text-xs">
                  Latest Groq AI resume audit evaluation.
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm" className="h-7 text-xs">
                <Link href="/dashboard/ai-analysis">Run AI Audit</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">ATS Match Score</span>
              <span className="text-foreground font-semibold">{resumeReadiness}/100</span>
            </div>
            <Progress value={resumeReadiness} className="h-1.5" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Practice Submissions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" /> Recent Practice Submissions
            </CardTitle>
            <CardDescription className="text-xs">Your latest problem solving activity</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">
            <Link href="/dashboard/learning">
              View All <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentSubmissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs">
              No coding submissions recorded yet. Start practicing to track progress!
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentSubmissions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between py-2.5 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-medium text-foreground">{sub.problem?.title || 'Coding Problem'}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {sub.problem?.category} • {sub.language.toUpperCase()} • {new Date(sub.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={sub.verdict === 'ACCEPTED' ? 'success' : 'destructive'}
                  >
                    {sub.verdict}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
