import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Flame,
  CheckCircle2,
  Zap,
  Award,
} from 'lucide-react';
import { CodingProblemFilters } from './problem-filters';
import { ProblemInfiniteList } from './problem-infinite-list';
import { getAssessmentProblems } from '@/services/assessment';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Coding Assessment Platform | CareerHub',
  description:
    'Practice DSA, System Design, SQL, and full-stack coding challenges with Docker sandbox compilation.',
};

export default async function CodingAssessmentPage({ searchParams }) {
  const session = await auth();
  const userId = session?.user?.id || null;

  const sp = await searchParams;
  const selectedCategory = sp?.category || 'ALL';
  const selectedDifficulty = sp?.difficulty || 'ALL';
  const selectedCompany = sp?.company || 'ALL';
  const searchQuery = sp?.search || '';
  const selectedStatus = sp?.status || 'ALL';
  const isBookmarkedOnly = sp?.bookmarked === 'true';

  // Run independent reads concurrently: stats, badges, and the first 20 matching problems only.
  const [userStats, userBadges, initialResult] = await Promise.all([
    userId
      ? prisma.userCodingStats.findUnique({
          where: { userId },
          select: { solvedCount: true, streakDays: true, points: true },
        })
      : null,
    userId
      ? prisma.userBadge.findMany({
          where: { userId },
          select: {
            id: true,
            badge: { select: { icon: true, name: true, description: true } },
          },
        })
      : [],
    getAssessmentProblems({
      category: selectedCategory,
      difficulty: selectedDifficulty,
      company: selectedCompany,
      search: searchQuery,
      status: selectedStatus,
      bookmarked: isBookmarkedOnly,
      userId,
      limit: 20,
      page: 1,
    }),
  ]);

  const activeFilters = {
    category: selectedCategory,
    difficulty: selectedDifficulty,
    company: selectedCompany,
    search: searchQuery,
    status: selectedStatus,
    bookmarked: isBookmarkedOnly,
  };

  const filterKey = `${selectedCategory}-${selectedDifficulty}-${selectedCompany}-${searchQuery}-${selectedStatus}-${isBookmarkedOnly}`;

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border border-border bg-card p-6 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Coding Assessment Platform
            </h1>
            <Badge variant="secondary" className="text-[10px]">
              Docker Judge
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Master Data Structures & Algorithms, System Design, SQL, and
            Full-Stack challenges with isolated container compilation across
            Python, Java, C++, JS, and TS.
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
              <p className="text-xs text-muted-foreground font-medium">
                Solved Problems
              </p>
              <h3 className="text-xl font-bold text-foreground">
                {userStats?.solvedCount || 0}
              </h3>
            </div>
            <div className="h-8 w-8 rounded-md bg-muted/50 border border-border flex items-center justify-center text-foreground">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground font-medium">
                Daily Streak
              </p>
              <h3 className="text-xl font-bold text-foreground">
                {userStats?.streakDays || 1} Days
              </h3>
            </div>
            <div className="h-8 w-8 rounded-md bg-muted/50 border border-border flex items-center justify-center text-foreground">
              <Flame className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground font-medium">
                Total Points
              </p>
              <h3 className="text-xl font-bold text-foreground">
                {userStats?.points || 0} PTS
              </h3>
            </div>
            <div className="h-8 w-8 rounded-md bg-muted/50 border border-border flex items-center justify-center text-foreground">
              <Zap className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground font-medium">
                Badges Earned
              </p>
              <h3 className="text-xl font-bold text-foreground">
                {userBadges.length}
              </h3>
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
                  <p className="text-foreground font-semibold">
                    {ub.badge.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {ub.badge.description}
                  </p>
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

      {/* Server-Side Paginated Problems with Client Infinite Scroll */}
      <ProblemInfiniteList
        key={filterKey}
        initialProblems={initialResult.problems}
        totalCount={initialResult.pagination.total}
        filters={activeFilters}
      />
    </div>
  );
}
