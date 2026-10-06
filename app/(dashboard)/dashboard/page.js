import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  Code2,
  FileText,
  User,
  ArrowRight,
  Bot,
  Target,
  Sparkles,
  Video,
  Clock,
  Briefcase,
  HelpCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Candidate Dashboard | CareerHub',
  description:
    'AI-powered career preparation, DSA progress tracking, interview prep, and skill development portal.',
};

export const dynamic = 'force-dynamic';

export default async function CandidateDashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Please sign in to access your dashboard.
        </p>
      </div>
    );
  }

  // Fetch authentic candidate data in parallel
  const [
    profile,
    resumesCount,
    codingStats,
    progressByStatus,
    recentSubmissions,
    latestAnalysis,
    mockSessionCount,
    interviewReportStats,
    availableProblems,
  ] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId },
      select: {
        headline: true,
        bio: true,
        _count: {
          select: {
            educations: true,
            experiences: true,
            skills: true,
            projects: true,
          },
        },
      },
    }),
    prisma.resume.count({ where: { userId } }),
    prisma.userCodingStats.findUnique({ where: { userId } }),
    prisma.userProblemProgress.groupBy({
      by: ['status'],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.problemSubmission.findMany({
      where: { userId },
      select: {
        id: true,
        language: true,
        verdict: true,
        createdAt: true,
        problem: { select: { title: true, category: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 4,
    }),
    prisma.resumeAnalysis.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { atsScore: true },
    }),
    prisma.interviewSession.count({ where: { userId } }),
    prisma.interviewReport.aggregate({
      where: { userId },
      _avg: { overallScore: true },
      _count: { _all: true },
    }),
    prisma.problem.count(),
  ]);

  // Profile completion score
  let profileScore = 20;
  if (profile?.headline) profileScore += 15;
  if (profile?.bio) profileScore += 15;
  if (profile?._count.skills > 0) profileScore += 15;
  if (profile?._count.experiences > 0) profileScore += 15;
  if (profile?._count.educations > 0) profileScore += 10;
  if (profile?._count.projects > 0) profileScore += 10;
  profileScore = Math.min(100, profileScore);

  // Solved counts
  const attemptedCount = progressByStatus.reduce(
    (total, item) => total + item._count._all,
    0
  );
  const solvedProgressCount =
    progressByStatus.find((item) => item.status === 'SOLVED')?._count._all ?? 0;
  const solvedCount = codingStats?.solvedCount ?? solvedProgressCount;
  const totalPlatformProblems = availableProblems || 1;
  const dsaProgressPercentage = Math.round(
    (solvedCount / totalPlatformProblems) * 100
  );

  // Readiness calculations
  const resumeReadiness =
    latestAnalysis?.atsScore ?? (resumesCount > 0 ? 50 : 0);
  const dsaReadiness = Math.min(100, Math.round((solvedCount / 20) * 100));
  const avgMock =
    interviewReportStats._count._all > 0
      ? Math.round(interviewReportStats._avg.overallScore ?? 0)
      : mockSessionCount > 0
        ? 40
        : 0;
  const interviewReadiness = avgMock;

  const careerReadinessScore = Math.round(
    profileScore * 0.2 +
      resumeReadiness * 0.25 +
      dsaReadiness * 0.25 +
      interviewReadiness * 0.3
  );

  // Preparation modules list
  const prepModules = [
    {
      title: 'Coding Assessment Platform',
      desc: '1,500+ algorithmic challenges with multi-language code evaluation.',
      href: '/dashboard/assessment',
      cta: 'Practice',
      icon: Code2,
    },
    {
      title: 'AI Mock Interview Simulator',
      desc: 'Voice & technical interview simulations with STAR methodology scoring.',
      href: '/dashboard/mock-interview',
      cta: 'Start Session',
      icon: Video,
    },
    {
      title: 'AI Resume Score & ATS Audit',
      desc: 'Keyword gap audit, recruiter screening criteria, and instant feedback.',
      href: '/dashboard/ai-analysis',
      cta: 'Audit Resume',
      icon: Bot,
    },
    {
      title: 'AI Job Matcher',
      desc: 'Match your verified skill profile with tailored engineering opportunities.',
      href: '/dashboard/job-match',
      cta: 'Match Jobs',
      icon: Target,
    },
    {
      title: 'HR & Technical Question Bank',
      desc: 'Curated behavioral questions, system design essentials, and concepts.',
      href: '/dashboard/interview-prep',
      cta: 'Study Questions',
      icon: HelpCircle,
    },
  ];

  return (
    <div className="space-y-6">
      {/* TOP: Welcome Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border border-border bg-card p-5 sm:p-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Welcome back, {session?.user?.name || 'Candidate'}
            </h1>
            <Badge variant="secondary" className="text-[10px] font-medium">
              Candidate
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            {profile?.headline ||
              'Your centralized workspace for technical interview preparation, algorithmic mastery, and career readiness.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button asChild size="sm">
            <Link href="/dashboard/assessment">
              <Code2 className="mr-1.5 h-3.5 w-3.5" /> Practice Problems
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/career-workspace">
              <Briefcase className="mr-1.5 h-3.5 w-3.5" /> Career Workspace
            </Link>
          </Button>
        </div>
      </div>

      {/* NEXT: 4 Compact Career Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Career Readiness */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Career Readiness
              </span>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {careerReadinessScore}%
            </div>
          </div>
          <div className="pt-2.5 space-y-1.5">
            <Progress value={careerReadinessScore} className="h-1.5" />
            <p className="text-[11px] text-muted-foreground">
              Composite readiness score
            </p>
          </div>
        </Card>

        {/* Metric 2: DSA Solved */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                DSA Solved
              </span>
              <Code2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {solvedCount}
            </div>
          </div>
          <div className="pt-2.5 space-y-1.5">
            <Progress value={dsaProgressPercentage} className="h-1.5" />
            <p className="text-[11px] text-muted-foreground">
              {dsaProgressPercentage}% of platform • {attemptedCount} attempted
            </p>
          </div>
        </Card>

        {/* Metric 3: Resume Match */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Resume ATS Match
              </span>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {resumeReadiness}/100
            </div>
          </div>
          <div className="pt-2.5 space-y-1.5">
            <Progress value={resumeReadiness} className="h-1.5" />
            <p className="text-[11px] text-muted-foreground">
              {resumesCount} resume{resumesCount !== 1 ? 's' : ''} on file
            </p>
          </div>
        </Card>

        {/* Metric 4: Interview Performance */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Mock Interview Score
              </span>
              <Video className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {interviewReadiness}%
            </div>
          </div>
          <div className="pt-2.5 space-y-1.5">
            <Progress value={interviewReadiness} className="h-1.5" />
            <p className="text-[11px] text-muted-foreground">
              {mockSessionCount} session{mockSessionCount !== 1 ? 's' : ''} recorded
            </p>
          </div>
        </Card>
      </div>

      {/* MAIN: Preparation & Practice (Left) + AI Coach & Progress (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Preparation & Practice Modules + Recent Activity */}
        <div className="lg:col-span-7 space-y-6">
          {/* Preparation & Practice Modules Card */}
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base font-semibold">
                Preparation & Practice
              </CardTitle>
              <CardDescription className="text-xs">
                Core modules to build technical mastery and interview readiness
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border">
              {prepModules.map((module) => {
                const IconComponent = module.icon;
                return (
                  <div
                    key={module.title}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 rounded-md bg-muted border border-border shrink-0 mt-0.5">
                        <IconComponent className="h-4 w-4 text-foreground" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {module.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {module.desc}
                        </p>
                      </div>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="shrink-0 h-8 text-xs"
                    >
                      <Link href={module.href}>
                        {module.cta} <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Recent Practice Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" /> Recent Practice Submissions
                </CardTitle>
                <CardDescription className="text-xs">
                  Your latest code evaluations and judge outcomes
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">
                <Link href="/dashboard/assessment">
                  Problem Bank <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {recentSubmissions.length === 0 ? (
                <div className="text-center py-8 px-4 text-muted-foreground text-xs space-y-2">
                  <Code2 className="h-6 w-6 mx-auto text-muted-foreground/50" />
                  <p>No coding submissions recorded yet. Start solving problems to track progress!</p>
                  <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                    <Link href="/dashboard/assessment">Solve First Problem</Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-muted/20 transition-colors"
                    >
                      <div className="space-y-0.5 min-w-0">
                        {sub.problem?.slug ? (
                          <Link
                            href={`/dashboard/assessment/problems/${sub.problem.slug}`}
                            className="font-medium text-foreground hover:underline truncate block"
                          >
                            {sub.problem.title}
                          </Link>
                        ) : (
                          <p className="font-medium text-foreground truncate">
                            {sub.problem?.title || 'Coding Problem'}
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground">
                          {sub.problem?.category} • {sub.language.toUpperCase()} •{' '}
                          {new Date(sub.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={sub.verdict === 'ACCEPTED' ? 'default' : 'secondary'}
                        className="shrink-0 text-[10px]"
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

        {/* Right Column (5 cols): AI Career Coach Insight & Profile Progress */}
        <div className="lg:col-span-5 space-y-6">
          {/* Integrated AI Career Coach Insight */}
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base font-semibold">
                    AI Career Coach Insight
                  </CardTitle>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  Personalized
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <div className="text-xs text-muted-foreground leading-relaxed">
                {dsaProgressPercentage < 30 ? (
                  <p>
                    <strong className="text-foreground">Recommended Focus:</strong> Your DSA progress is currently at{' '}
                    {dsaProgressPercentage}%. Target 5 additional problems in Arrays and Hashing to unlock deeper algorithm recommendations.
                  </p>
                ) : resumeReadiness < 70 ? (
                  <p>
                    <strong className="text-foreground">Recommended Focus:</strong> Your resume ATS score is at{' '}
                    {resumeReadiness}/100. Enhance measurable impact metrics in your experience section to improve recruiter visibility.
                  </p>
                ) : (
                  <p>
                    <strong className="text-foreground">Strong Momentum!</strong> Your technical readiness is well balanced. Schedule an AI mock interview session to fine-tune your real-time responses.
                  </p>
                )}
              </div>
              <Button asChild size="sm" className="w-full">
                <Link href="/dashboard/career-coach">
                  Open AI Career Coach <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Clean Profile / Career Progress Section */}
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-foreground" /> Profile & Career Progress
                </CardTitle>
                <Button asChild variant="outline" size="sm" className="h-7 text-xs">
                  <Link href="/dashboard/profile">Edit Profile</Link>
                </Button>
              </div>
              <CardDescription className="text-xs">
                Strengthen candidate visibility for recruiters
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Profile Strength</span>
                  <span className="text-foreground font-semibold">{profileScore}%</span>
                </div>
                <Progress value={profileScore} className="h-1.5" />
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                <div className="p-2.5 rounded-md bg-muted/40 border border-border">
                  <span className="text-muted-foreground text-[11px] block">Skills Listed</span>
                  <p className="font-semibold text-foreground text-sm mt-0.5">
                    {profile?._count.skills || 0}
                  </p>
                </div>
                <div className="p-2.5 rounded-md bg-muted/40 border border-border">
                  <span className="text-muted-foreground text-[11px] block">Experience</span>
                  <p className="font-semibold text-foreground text-sm mt-0.5">
                    {profile?._count.experiences || 0} entries
                  </p>
                </div>
                <div className="p-2.5 rounded-md bg-muted/40 border border-border">
                  <span className="text-muted-foreground text-[11px] block">Projects</span>
                  <p className="font-semibold text-foreground text-sm mt-0.5">
                    {profile?._count.projects || 0} items
                  </p>
                </div>
                <div className="p-2.5 rounded-md bg-muted/40 border border-border">
                  <span className="text-muted-foreground text-[11px] block">Education</span>
                  <p className="font-semibold text-foreground text-sm mt-0.5">
                    {profile?._count.educations || 0} records
                  </p>
                </div>
              </div>

              <Button
                asChild
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground hover:text-foreground justify-between h-8"
              >
                <Link href="/dashboard/career-workspace">
                  <span>View full Career Workspace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
