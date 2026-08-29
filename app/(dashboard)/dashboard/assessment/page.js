import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Code2,
  Trophy,
  Flame,
  CheckCircle2,
  Zap,
  Target,
  Sparkles,
  Search,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Award,
} from 'lucide-react';
import { CodingProblemFilters } from './problem-filters';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Coding Assessment Platform | CareerHub',
  description: 'Practice DSA, System Design, SQL, and full-stack coding challenges with Docker sandbox compilation.',
};

export default async function CodingAssessmentPage({ searchParams }) {
  const session = await auth();
  const userId = session?.user?.id;

  const sp = await searchParams;
  const selectedCategory = sp?.category || 'ALL';
  const selectedDifficulty = sp?.difficulty || 'ALL';
  const selectedCompany = sp?.company || 'ALL';
  const searchQuery = sp?.search || '';
  const selectedStatus = sp?.status || 'ALL';
  const isBookmarkedOnly = sp?.bookmarked === 'true';

  // 1. Fetch User Stats & Badges
  let userStats = null;
  let userBadges = [];
  if (userId) {
    if (prisma.userCodingStats?.findUnique) {
      userStats = await prisma.userCodingStats.findUnique({
        where: { userId },
      });
    }
    if (prisma.userBadge?.findMany) {
      userBadges = await prisma.userBadge.findMany({
        where: { userId },
        include: { badge: true },
      });
    }
  }

  // 2. Build Problem Query Filter
  const AND = [];
  if (selectedCategory !== 'ALL') {
    AND.push({
      OR: [
        { category: { equals: selectedCategory, mode: 'insensitive' } },
        { tags: { has: selectedCategory } },
      ],
    });
  }
  if (selectedCompany !== 'ALL') {
    AND.push({
      companyTags: { has: selectedCompany },
    });
  }
  if (selectedDifficulty !== 'ALL') {
    AND.push({ difficulty: selectedDifficulty });
  }
  if (searchQuery) {
    AND.push({
      OR: [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
        { tags: { has: searchQuery } },
        { companyTags: { has: searchQuery } },
      ],
    });
  }

  const where = AND.length > 0 ? { AND } : {};

  // 3. Fetch Problems
  let problems = (prisma.problem?.findMany)
    ? await prisma.problem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      })
    : [];

  // 4. Fetch User Problem Progress
  let progressMap = {};
  let bookmarkMap = {};
  if (userId && prisma.userProblemProgress?.findMany) {
    const userProgress = await prisma.userProblemProgress.findMany({
      where: { userId },
    });
    userProgress.forEach((p) => {
      progressMap[p.problemId] = p.status;
      bookmarkMap[p.problemId] = p.bookmarked;
    });
  }

  // Filter by status or bookmark if requested
  if (selectedStatus !== 'ALL') {
    problems = problems.filter((p) => {
      const pStatus = progressMap[p.id] || 'UNSOLVED';
      return pStatus === selectedStatus;
    });
  }

  if (isBookmarkedOnly) {
    problems = problems.filter((p) => bookmarkMap[p.id] === true);
  }

  const getDifficultyBadge = (diff) => {
    if (diff === 'EASY')
      return <Badge variant="success">Easy</Badge>;
    if (diff === 'MEDIUM')
      return <Badge variant="warning">Medium</Badge>;
    return <Badge variant="destructive">Hard</Badge>;
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border border-border bg-card p-6 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Coding Assessment Platform
            </h1>
            <Badge variant="secondary" className="text-[10px]">Docker Judge</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Master Data Structures & Algorithms, System Design, SQL, and Full-Stack challenges with isolated container compilation across Python, Java, C++, JS, and TS.
          </p>
        </div>

        {/* Quick Action Links */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button asChild size="sm">
            <Link href="/dashboard/assessment/leaderboard">
              <Trophy className="mr-1.5 h-3.5 w-3.5" /> Global Leaderboard
            </Link>
          </Button>
          {session?.user?.role === 'RECRUITER' && (
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/recruiter/assessments">
                Recruiter Portal
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Candidate Performance Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground font-medium">Solved Problems</p>
              <h3 className="text-xl font-bold text-foreground">{userStats?.solvedCount || 0}</h3>
            </div>
            <div className="h-8 w-8 rounded-md bg-muted/50 border border-border flex items-center justify-center text-foreground">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground font-medium">Daily Streak</p>
              <h3 className="text-xl font-bold text-foreground">{userStats?.streakDays || 1} Days</h3>
            </div>
            <div className="h-8 w-8 rounded-md bg-muted/50 border border-border flex items-center justify-center text-foreground">
              <Flame className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground font-medium">Total Points</p>
              <h3 className="text-xl font-bold text-foreground">{userStats?.points || 0} PTS</h3>
            </div>
            <div className="h-8 w-8 rounded-md bg-muted/50 border border-border flex items-center justify-center text-foreground">
              <Zap className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground font-medium">Badges Earned</p>
              <h3 className="text-xl font-bold text-foreground">{userBadges.length}</h3>
            </div>
            <div className="h-8 w-8 rounded-md bg-muted/50 border border-border flex items-center justify-center text-foreground">
              <Award className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges Preview Carousel / Grid */}
      {userBadges.length > 0 && (
        <Card className="p-4">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-foreground" /> Earned Achievements
          </h4>
          <div className="flex flex-wrap gap-2">
            {userBadges.map((ub) => (
              <div
                key={ub.id}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-secondary border border-border text-xs"
              >
                <span className="text-sm">{ub.badge.icon}</span>
                <div>
                  <p className="text-foreground font-semibold">{ub.badge.name}</p>
                  <p className="text-[10px] text-muted-foreground">{ub.badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Client Filter Controls */}
      <CodingProblemFilters
        currentCategory={selectedCategory}
        currentDifficulty={selectedDifficulty}
        currentCompany={selectedCompany}
        currentSearch={searchQuery}
        currentStatus={selectedStatus}
        currentBookmarked={sp?.bookmarked}
      />

      {/* Problems Table / Grid */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Coding Challenges Database</CardTitle>
              <CardDescription className="text-xs">
                Showing {problems.length} practice problems across DSA, System Design, SQL, and Full-Stack
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {problems.length > 0 ? (
              problems.map((problem) => {
                const status = progressMap[problem.id] || 'UNSOLVED';
                return (
                  <div
                    key={problem.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        {status === 'SOLVED' && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        )}
                        <Link
                          href={`/dashboard/assessment/problems/${problem.slug}`}
                          className="font-semibold text-sm text-foreground hover:underline"
                        >
                          {problem.title}
                        </Link>
                        {getDifficultyBadge(problem.difficulty)}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px]">
                          {problem.category}
                        </Badge>
                        {problem.tags.map((tag, tIdx) => (
                          <span key={tIdx} className="bg-muted px-1.5 py-0.5 rounded text-[10px]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right text-xs text-muted-foreground hidden md:block">
                        <p className="font-semibold text-foreground">{problem.acceptanceRate}% Rate</p>
                        <p className="text-[10px]">{problem.totalSubmissions} Submissions</p>
                      </div>

                      <Button asChild size="sm" variant={status === 'SOLVED' ? 'outline' : 'default'}>
                        <Link href={`/dashboard/assessment/problems/${problem.slug}`}>
                          {status === 'SOLVED' ? 'Re-Solve' : 'Solve'}
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-muted-foreground space-y-3">
                <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/50" />
                <p className="text-xs">No coding problems found matching your filters.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
