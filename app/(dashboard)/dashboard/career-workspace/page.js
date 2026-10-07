import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  FileText,
  BookOpen,
  TrendingUp,
  User,
  ArrowRight,
  Code2,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { CareerWorkspaceHeader } from '@/components/career-workspace/career-workspace-header';

export const metadata = {
  title: 'My Workspace | CareerHub',
  description:
    'Centralized career management: your resumes, learning roadmaps, skill analytics, and professional profile.',
};

export const dynamic = 'force-dynamic';

export default async function CareerWorkspacePage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Please sign in to access My Workspace.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header renders immediately without waiting for database queries */}
      <CareerWorkspaceHeader
        title="My Workspace"
        description="Manage your professional resumes, learning sequence, technical skill growth, and public profile."
      />

      {/* 4 Core Workspace Pillars streamed via Suspense */}
      <Suspense fallback={<WorkspacePillarsSkeleton />}>
        <WorkspacePillars userId={userId} />
      </Suspense>

      {/* Recent Activity stream via Suspense */}
      <Suspense fallback={<WorkspaceActivitySkeleton />}>
        <WorkspaceRecentActivity userId={userId} />
      </Suspense>
    </div>
  );
}

// Async component for 4 Workspace Pillars
async function WorkspacePillars({ userId }) {
  const [
    profile,
    resumesCount,
    codingStats,
    latestAnalysis,
    availableProblemsCount,
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
    prisma.userCodingStats.findUnique({
      where: { userId },
      select: { solvedCount: true },
    }),
    prisma.resumeAnalysis.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { atsScore: true },
    }),
    prisma.problem.count(),
  ]);

  // Profile strength score
  let profileScore = 20;
  if (profile?.headline) profileScore += 15;
  if (profile?.bio) profileScore += 15;
  if (profile?._count.skills > 0) profileScore += 15;
  if (profile?._count.experiences > 0) profileScore += 15;
  if (profile?._count.educations > 0) profileScore += 10;
  if (profile?._count.projects > 0) profileScore += 10;
  profileScore = Math.min(100, profileScore);

  // Coding progress
  const solvedCount = codingStats?.solvedCount || 0;
  const totalPlatformProblems = availableProblemsCount || 1;
  const dsaProgressPercentage = Math.round(
    (solvedCount / totalPlatformProblems) * 100
  );

  const resumeReadiness =
    latestAnalysis?.atsScore ?? (resumesCount > 0 ? 50 : 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Pillar 1: My Resumes */}
      <Card className="flex flex-col justify-between">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted border border-border">
                <FileText className="h-4.5 w-4.5 text-foreground" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">
                  My Resumes
                </CardTitle>
                <CardDescription className="text-xs">
                  CV files, PDF storage & ATS keyword optimization
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-[11px]">
              {resumesCount} file{resumesCount === 1 ? '' : 's'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">Latest ATS Match</span>
              <span className="font-semibold text-foreground">
                {resumeReadiness}/100
              </span>
            </div>
            <Progress value={resumeReadiness} className="h-1.5" />
            <p className="text-[11px] text-muted-foreground pt-1">
              {resumesCount > 0
                ? 'Your default resume is ready for job applications and ATS audits.'
                : 'Upload your first PDF resume to run Groq AI audits and job matching.'}
            </p>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <Button asChild size="sm" className="w-full">
              <Link href="/dashboard/resumes">
                Manage Resumes <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pillar 2: My Learning */}
      <Card className="flex flex-col justify-between">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted border border-border">
                <BookOpen className="h-4.5 w-4.5 text-foreground" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">
                  My Learning
                </CardTitle>
                <CardDescription className="text-xs">
                  Structured DSA curriculum & topic progression
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-[11px]">
              Roadmap Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">Roadmap Progression</span>
              <span className="font-semibold text-foreground">
                {dsaProgressPercentage}%
              </span>
            </div>
            <Progress value={dsaProgressPercentage} className="h-1.5" />
            <p className="text-[11px] text-muted-foreground pt-1">
              Arrays → Hashing → Two Pointers → Sliding Window → Binary Search.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <Button asChild size="sm" className="w-full">
              <Link href="/dashboard/learning">
                Explore Learning Roadmap <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pillar 3: Skill Progress */}
      <Card className="flex flex-col justify-between">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted border border-border">
                <TrendingUp className="h-4.5 w-4.5 text-foreground" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">
                  Skill Progress
                </CardTitle>
                <CardDescription className="text-xs">
                  Topic mastery analytics across 20 algorithmic categories
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-[11px]">
              {solvedCount} Solved
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">DSA Problems Solved</span>
              <span className="font-semibold text-foreground">{solvedCount}</span>
            </div>
            <Progress
              value={Math.min(100, (solvedCount / 50) * 100)}
              className="h-1.5"
            />
            <p className="text-[11px] text-muted-foreground pt-1">
              Detailed breakdowns by difficulty, tag frequency, and judge verdicts.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <Button asChild size="sm" className="w-full">
              <Link href="/dashboard/skill-progress">
                View Skill Progress <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pillar 4: My Profile */}
      <Card className="flex flex-col justify-between">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted border border-border">
                <User className="h-4.5 w-4.5 text-foreground" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">
                  My Profile
                </CardTitle>
                <CardDescription className="text-xs">
                  Candidate bio, skills, experience, and recruiter visibility
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-[11px]">
              {profileScore}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">Profile Strength</span>
              <span className="font-semibold text-foreground">
                {profileScore}%
              </span>
            </div>
            <Progress value={profileScore} className="h-1.5" />
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
              <span>{profile?._count.skills || 0} skills</span>
              <span>•</span>
              <span>{profile?._count.experiences || 0} exp</span>
              <span>•</span>
              <span>{profile?._count.projects || 0} projects</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <Button asChild size="sm" className="w-full">
              <Link href="/dashboard/profile">
                Edit Profile <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Async component for Recent Activity
async function WorkspaceRecentActivity({ userId }) {
  const recentSubmissions = await prisma.problemSubmission.findMany({
    where: { userId },
    select: {
      id: true,
      language: true,
      verdict: true,
      createdAt: true,
      problem: { select: { title: true, category: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" /> Recent Coding Submissions
          </CardTitle>
          <CardDescription className="text-xs">
            Latest activity tracked in your learning workspace
          </CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="h-7 text-xs self-start sm:self-auto">
          <Link href="/dashboard/assessment">
            Practice More <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {recentSubmissions.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">
            No recent coding submissions. Start practicing to populate your workspace activity!
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
                  variant={
                    sub.verdict === 'ACCEPTED' ? 'default' : 'secondary'
                  }
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
  );
}

// Skeletons matching exact card geometry
function WorkspacePillarsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-9 w-9 rounded-md" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-44" />
                </div>
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-9 w-full rounded-md pt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function WorkspaceActivitySkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3 border-b border-border">
        <Skeleton className="h-5 w-48" />
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between items-center py-2">
            <div className="space-y-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
