import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  BookOpen,
  Code2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  Bot,
  Zap,
  Clock,
  ChevronRight,
  PlayCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Candidate Learning Dashboard | CareerHub',
  description: 'Track your personalized DSA roadmap, topic weaknesses, interview prep, and learning activity.',
};

export default async function LearningDashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6 text-center">
        <p className="text-muted-foreground">Please sign in to view your learning dashboard.</p>
      </div>
    );
  }

  // Fetch candidate authentic database records
  const [
    userProgress,
    recentSubmissions,
    codingStats,
    interviewSessions,
    interviewReports,
    latestAnalysis,
    profile,
    availableProblems,
  ] = await Promise.all([
    prisma.userProblemProgress.findMany({
      where: { userId },
      include: { problem: true },
    }),
    prisma.problemSubmission.findMany({
      where: { userId },
      include: { problem: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    prisma.userCodingStats.findUnique({ where: { userId } }),
    prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.interviewReport.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.resumeAnalysis.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.profile.findUnique({
      where: { userId },
      include: { skills: true, experiences: true, educations: true, projects: true },
    }),
    prisma.problem.findMany({
      select: { id: true, title: true, slug: true, category: true, difficulty: true, tags: true },
    }),
  ]);

  // Total available problems in platform
  const totalPlatformProblems = availableProblems.length || 1;

  // Real solved & attempted calculations
  const solvedProgress = userProgress.filter((p) => p.status === 'SOLVED');
  const attemptedProgress = userProgress.filter((p) => p.status === 'ATTEMPTED');

  const solvedCount = codingStats?.solvedCount ?? solvedProgress.length;
  const easySolved = codingStats?.easySolved ?? solvedProgress.filter((p) => p.problem.difficulty === 'EASY').length;
  const mediumSolved = codingStats?.mediumSolved ?? solvedProgress.filter((p) => p.problem.difficulty === 'MEDIUM').length;
  const hardSolved = codingStats?.hardSolved ?? solvedProgress.filter((p) => p.problem.difficulty === 'HARD').length;
  const totalAttempted = userProgress.length;

  const dsaProgressPercentage = Math.round((solvedCount / totalPlatformProblems) * 100);

  // Analyze topic frequencies and success rates from user submissions
  const topicStats = {};
  recentSubmissions.forEach((sub) => {
    const category = sub.problem?.category || 'Arrays';
    if (!topicStats[category]) {
      topicStats[category] = { total: 0, accepted: 0, failed: 0 };
    }
    topicStats[category].total += 1;
    if (sub.verdict === 'ACCEPTED') {
      topicStats[category].accepted += 1;
    } else {
      topicStats[category].failed += 1;
    }
  });

  // Standard DSA Learning Roadmap
  const defaultRoadmap = [
    { name: 'Arrays', topic: 'Arrays', desc: 'Contiguous data structures, element manipulation & traversal' },
    { name: 'Hashing', topic: 'Hashing', desc: 'Key-value maps, frequency tables & constant time lookups' },
    { name: 'Two Pointers', topic: 'Two Pointers', desc: 'Opposite/same direction pointer pairs for sorted search' },
    { name: 'Sliding Window', topic: 'Sliding Window', desc: 'Dynamic subarray scanning & window optimization' },
    { name: 'Binary Search', topic: 'Binary Search', desc: 'Logarithmic search space reduction & threshold boundaries' },
    { name: 'Linked List', topic: 'Linked List', desc: 'Node pointer traversal, fast-slow pointers & reversal' },
    { name: 'Stack & Queue', topic: 'Stack', desc: 'LIFO evaluation, monotonic stacks & FIFO buffers' },
    { name: 'Trees & BST', topic: 'Trees', desc: 'Recursive traversals, depth-first search & binary search trees' },
    { name: 'Graphs', topic: 'Graphs', desc: 'Adjacency lists, BFS/DFS traversal & shortest path algorithms' },
    { name: 'Dynamic Programming', topic: 'Dynamic Programming', desc: 'Memoization, tabulation & optimal substructure decomposition' },
  ];

  // Dynamic roadmap determination based on real activity
  const roadmapStatus = defaultRoadmap.map((item) => {
    const solvedInTopic = solvedProgress.filter(
      (p) => p.problem.category === item.topic || p.problem.tags.includes(item.topic)
    );
    const attemptedInTopic = userProgress.filter(
      (p) => p.problem.category === item.topic || p.problem.tags.includes(item.topic)
    );
    const statsInTopic = topicStats[item.topic];

    let status = 'UPCOMING'; // UPCOMING, IN_PROGRESS, NEEDS_IMPROVEMENT, MASTERED
    if (solvedInTopic.length >= 2) {
      status = 'MASTERED';
    } else if (statsInTopic && statsInTopic.failed > statsInTopic.accepted) {
      status = 'NEEDS_IMPROVEMENT';
    } else if (attemptedInTopic.length > 0) {
      status = 'IN_PROGRESS';
    }

    return {
      ...item,
      status,
      solvedCount: solvedInTopic.length,
      attemptedCount: attemptedInTopic.length,
    };
  });

  // Calculate Recommended Next Topic & Continue Learning
  const weakTopicObj = roadmapStatus.find((r) => r.status === 'NEEDS_IMPROVEMENT');
  const activeTopicObj = roadmapStatus.find((r) => r.status === 'IN_PROGRESS');
  const upcomingTopicObj = roadmapStatus.find((r) => r.status === 'UPCOMING');

  const recommendedNextTopic = weakTopicObj || activeTopicObj || upcomingTopicObj || roadmapStatus[0];

  // Recommended Problems for Next Topic
  const recommendedProblems = availableProblems
    .filter((p) => p.category === recommendedNextTopic.topic || p.tags.includes(recommendedNextTopic.topic))
    .slice(0, 3);

  // Calculate Interview Preparation Progress
  const completedInterviewSessions = interviewSessions.filter((s) => s.status === 'COMPLETED').length;
  const avgInterviewScore =
    interviewReports.length > 0
      ? Math.round(interviewReports.reduce((acc, r) => acc + r.overallScore, 0) / interviewReports.length)
      : 0;

  // Calculate Resume Preparation Progress
  let profileScore = 20;
  if (profile?.headline) profileScore += 15;
  if (profile?.bio) profileScore += 15;
  if (profile?.skills?.length > 0) profileScore += 15;
  if (profile?.experiences?.length > 0) profileScore += 15;
  if (profile?.educations?.length > 0) profileScore += 10;
  if (profile?.projects?.length > 0) profileScore += 10;
  profileScore = Math.min(100, profileScore);

  const atsScore = latestAnalysis?.atsScore ?? 0;
  const resumePrepProgress = Math.round((profileScore + atsScore) / 2);

  const hasActivity = totalAttempted > 0 || interviewSessions.length > 0 || latestAnalysis !== null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-card p-6 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Candidate Learning Dashboard</h1>
            <Badge variant="secondary" className="text-[10px]">Adaptive Roadmap</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Your personalized learning roadmap driven by real problem submissions, weak topic detection, and mock interview performance.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Button asChild size="sm">
            <Link href="/dashboard/assessment">
              <Code2 className="mr-2 h-3.5 w-3.5" /> Coding Assessment
            </Link>
          </Button>
        </div>
      </div>

      {!hasActivity && (
        <Card className="border-violet-500/30 bg-violet-500/5 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10 text-violet-500 mb-4">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Start practicing to build your progress.</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Solve coding problems, complete mock interviews, or run an AI resume audit to unlock real-time learning metrics and weak-topic analysis.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
            <Button asChild size="sm" className="bg-violet-600 hover:bg-violet-700 text-white">
              <Link href="/dashboard/assessment">
                <Code2 className="mr-2 h-4 w-4" /> Start DSA Practice
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/interview-prep">Practice Questions</Link>
            </Button>
          </div>
        </Card>
      )}

      {/* Recommended Next Topic & Continue Learning Hero Card */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-card to-background relative overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge className="bg-violet-600 text-white border-0 text-xs">Recommended Next Topic</Badge>
              {recommendedNextTopic.status === 'NEEDS_IMPROVEMENT' && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="mr-1 h-3 w-3" /> Needs Improvement
                </Badge>
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-foreground mt-2">
              {recommendedNextTopic.name}
            </CardTitle>
            <CardDescription className="text-sm">
              {recommendedNextTopic.desc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-xs text-muted-foreground border-y border-border/50 py-3">
              <div>
                Progress: <span className="font-semibold text-foreground">{recommendedNextTopic.solvedCount} solved</span>
              </div>
              <div>•</div>
              <div>
                Attempted: <span className="font-semibold text-foreground">{recommendedNextTopic.attemptedCount} problems</span>
              </div>
              <div>•</div>
              <div>
                Sequence: <span className="font-semibold text-violet-600">Arrays → Hashing → Two Pointers → Sliding Window</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <PlayCircle className="h-4 w-4 text-violet-500" /> Suggested Practice Problems
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {recommendedProblems.length > 0 ? (
                  recommendedProblems.map((prob) => (
                    <Link
                      key={prob.id}
                      href={`/dashboard/assessment`}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/60 hover:border-violet-500/40 hover:bg-violet-500/5 transition-all text-xs"
                    >
                      <div>
                        <span className="font-medium text-foreground">{prob.title}</span>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                          <span className="capitalize">{prob.category}</span>
                          <span>•</span>
                          <span
                            className={
                              prob.difficulty === 'EASY'
                                ? 'text-emerald-500'
                                : prob.difficulty === 'MEDIUM'
                                ? 'text-amber-500'
                                : 'text-rose-500'
                            }
                          >
                            {prob.difficulty}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground col-span-2 py-2">No direct practice problems found for this category yet.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Continue Learning Callout */}
        <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-card to-background flex flex-col justify-between">
          <CardHeader className="pb-3">
            <Badge variant="outline" className="w-max border-indigo-500/30 text-indigo-600 text-xs">
              <Zap className="mr-1 h-3 w-3 text-amber-500 fill-amber-500" /> Continue Learning
            </Badge>
            <CardTitle className="text-lg font-semibold mt-2">Active Practice Tracker</CardTitle>
            <CardDescription className="text-xs">
              Maintain your daily learning momentum across algorithms and technical prep.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>DSA Platform Mastery</span>
                <span className="text-violet-600">{dsaProgressPercentage}%</span>
              </div>
              <Progress value={dsaProgressPercentage} className="h-2" />
            </div>

            <div className="rounded-lg bg-card/60 p-3 border border-border/50 space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Attempted Problems:</span>
                <span className="font-semibold text-foreground">{totalAttempted}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Solved Problems:</span>
                <span className="font-semibold text-emerald-500">{solvedCount}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Mock Sessions:</span>
                <span className="font-semibold text-indigo-500">{completedInterviewSessions}</span>
              </div>
            </div>

            <Button asChild className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs">
              <Link href="/dashboard/assessment">
                Resume Assessment <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Progress Breakdown Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/50 bg-card/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Code2 className="h-4 w-4 text-violet-600" /> DSA Progress
              </CardTitle>
              <Badge variant="secondary" className="text-[10px]">
                {solvedCount} Solved
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center py-1">
              <div className="rounded border border-emerald-500/20 bg-emerald-500/5 p-2">
                <p className="text-xs text-muted-foreground">Easy</p>
                <p className="text-lg font-bold text-emerald-500">{easySolved}</p>
              </div>
              <div className="rounded border border-amber-500/20 bg-amber-500/5 p-2">
                <p className="text-xs text-muted-foreground">Medium</p>
                <p className="text-lg font-bold text-amber-500">{mediumSolved}</p>
              </div>
              <div className="rounded border border-rose-500/20 bg-rose-500/5 p-2">
                <p className="text-xs text-muted-foreground">Hard</p>
                <p className="text-lg font-bold text-rose-500">{hardSolved}</p>
              </div>
            </div>
            <Progress value={dsaProgressPercentage} className="h-1.5" />
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-600" /> Interview Preparation
              </CardTitle>
              <Badge variant="secondary" className="text-[10px]">
                {completedInterviewSessions} Sessions
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border/40 text-xs">
              <span className="text-muted-foreground">Completed Sessions:</span>
              <span className="font-semibold text-foreground">{completedInterviewSessions}</span>
            </div>
            <div className="flex justify-between items-center py-1 text-xs">
              <span className="text-muted-foreground">Avg Performance Score:</span>
              <span className="font-semibold text-indigo-600">{avgInterviewScore}/100</span>
            </div>
            <Progress value={avgInterviewScore} className="h-1.5" />
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Bot className="h-4 w-4 text-purple-600" /> Resume Preparation
              </CardTitle>
              <Badge variant="secondary" className="text-[10px]">
                {atsScore > 0 ? `${atsScore}% ATS` : 'Pending'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border/40 text-xs">
              <span className="text-muted-foreground">Profile Strength:</span>
              <span className="font-semibold text-foreground">{profileScore}%</span>
            </div>
            <div className="flex justify-between items-center py-1 text-xs">
              <span className="text-muted-foreground">ATS Audit Readiness:</span>
              <span className="font-semibold text-purple-600">{atsScore}/100</span>
            </div>
            <Progress value={resumePrepProgress} className="h-1.5" />
          </CardContent>
        </Card>
      </div>

      {/* Learning Roadmap Table / Path */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Award className="h-5 w-5 text-violet-600" /> Learning Roadmap & Topic Sequence
              </CardTitle>
              <CardDescription className="text-xs">
                Sequential topic recommendation automatically calculated based on your topic submissions and accuracy.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs border-violet-500/30 text-violet-600">
              Arrays → Hashing → Two Pointers → Sliding Window
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {roadmapStatus.map((step, idx) => (
              <div
                key={step.name}
                className={`p-4 rounded-xl border transition-all ${
                  step.status === 'MASTERED'
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : step.status === 'NEEDS_IMPROVEMENT'
                    ? 'border-rose-500/40 bg-rose-500/5'
                    : step.status === 'IN_PROGRESS'
                    ? 'border-violet-500/40 bg-violet-500/10'
                    : 'border-border/40 bg-card/40 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-muted-foreground">Step 0{idx + 1}</span>
                  {step.status === 'MASTERED' && (
                    <Badge className="bg-emerald-500 text-white text-[9px] px-1.5 py-0">Mastered</Badge>
                  )}
                  {step.status === 'NEEDS_IMPROVEMENT' && (
                    <Badge variant="destructive" className="text-[9px] px-1.5 py-0">Needs Improvement</Badge>
                  )}
                  {step.status === 'IN_PROGRESS' && (
                    <Badge className="bg-violet-600 text-white text-[9px] px-1.5 py-0">Active</Badge>
                  )}
                  {step.status === 'UPCOMING' && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0">Upcoming</Badge>
                  )}
                </div>
                <h4 className="font-bold text-sm text-foreground">{step.name}</h4>
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{step.desc}</p>

                <div className="mt-3 pt-2 border-t border-border/30 flex justify-between items-center text-[10px]">
                  <span className="text-muted-foreground">{step.solvedCount} Solved</span>
                  <Link
                    href={`/dashboard/assessment`}
                    className="text-violet-600 hover:underline font-semibold flex items-center gap-0.5"
                  >
                    Practice <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recently Practiced Activity */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-violet-600" /> Recently Practiced Submissions
          </CardTitle>
          <CardDescription className="text-xs">Your latest problem submissions and judgment verdicts.</CardDescription>
        </CardHeader>
        <CardContent>
          {recentSubmissions.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No recent coding submissions found. Start practicing in Coding Assessment!
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {recentSubmissions.map((sub) => (
                <div key={sub.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        sub.verdict === 'ACCEPTED' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    <div>
                      <p className="font-medium text-foreground">{sub.problem?.title || 'Coding Problem'}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                        <span className="capitalize">{sub.problem?.category}</span>
                        <span>•</span>
                        <span className="uppercase">{sub.language}</span>
                        <span>•</span>
                        <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      variant="outline"
                      className={
                        sub.verdict === 'ACCEPTED'
                          ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5'
                          : 'border-rose-500/30 text-rose-500 bg-rose-500/5'
                      }
                    >
                      {sub.verdict}
                    </Badge>
                    <Button asChild size="sm" variant="ghost" className="h-7 text-xs text-violet-600">
                      <Link href="/dashboard/assessment">Solve Again</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
