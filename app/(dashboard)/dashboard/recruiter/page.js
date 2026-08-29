import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  Briefcase,
  Users,
  Building2,
  PlusCircle,
  CheckCircle2,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

export const metadata = {
  title: 'Recruiter Dashboard | CareerHub',
};

export default async function RecruiterDashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  // Fetch recruiter data
  const [company, jobsCount, activeJobsCount, applicationsCount, shortlistedCount, recentApplications] =
    await Promise.all([
      prisma.company.findUnique({ where: { recruiterId: userId } }),
      prisma.job.count({ where: { recruiterId: userId } }),
      prisma.job.count({ where: { recruiterId: userId, status: 'PUBLISHED' } }),
      prisma.application.count({ where: { job: { recruiterId: userId } } }),
      prisma.application.count({ where: { job: { recruiterId: userId }, status: 'SHORTLISTED' } }),
      prisma.application.findMany({
        where: { job: { recruiterId: userId } },
        include: {
          candidate: { select: { name: true, email: true, image: true } },
          job: { select: { title: true } },
        },
        orderBy: { appliedAt: 'desc' },
        take: 5,
      }),
    ]);

  const stats = [
    { title: 'Total Jobs Posted', value: jobsCount, icon: Briefcase, color: 'text-violet-600', bg: 'bg-violet-500/10' },
    { title: 'Active Listings', value: activeJobsCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { title: 'Total Applicants', value: applicationsCount, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
    { title: 'Shortlisted', value: shortlistedCount, icon: UserCheck, color: 'text-amber-600', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-violet-700 via-indigo-700 to-purple-700 p-6 sm:p-8 text-white shadow-xl shadow-violet-500/10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Recruiter Workspace — {company?.name || 'Hiring Team'} 👋
          </h1>
          <p className="mt-2 text-sm text-violet-100 max-w-xl leading-relaxed">
            Manage your open position requisitions, review candidate profiles, shortlist top talent, and build high-performing teams.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button asChild className="bg-white text-violet-700 hover:bg-violet-50 font-medium shadow-md">
            <Link href="/dashboard/recruiter/jobs/create">
              <PlusCircle className="mr-2 h-4 w-4" /> Post New Job
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10">
            <Link href="/dashboard/company">
              <Building2 className="mr-2 h-4 w-4" /> Edit Company
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/50 bg-card/60 backdrop-blur-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight">{stat.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Applicant Submissions */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Recent Applicants</CardTitle>
            <CardDescription className="text-sm">Candidates who recently applied to your job postings</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/recruiter/applicants">View All Applicants</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentApplications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No applications received yet. Create and publish a job listing to attract candidates!
            </div>
          ) : (
            <div className="space-y-4">
              {recentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between border-b border-border/40 pb-4 last:border-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {app.candidate?.image && <AvatarImage src={app.candidate.image} />}
                      <AvatarFallback className="bg-violet-600 text-white font-semibold">
                        {getInitials(app.candidate?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{app.candidate?.name || 'Applicant'}</p>
                      <p className="text-xs text-muted-foreground">Applied for <span className="font-medium text-foreground">{app.job.title}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="capitalize text-xs">
                      {app.status.toLowerCase()}
                    </Badge>
                    <Button asChild variant="ghost" size="sm" className="text-xs">
                      <Link href={`/dashboard/recruiter/applicants?id=${app.id}`}>
                        Review <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
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
