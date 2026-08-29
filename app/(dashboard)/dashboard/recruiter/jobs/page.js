import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Briefcase, PlusCircle, Users, Eye, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JobDeleteButton } from '@/components/jobs/delete-button';

export const metadata = {
  title: 'Manage Jobs | CareerHub',
};

export default async function RecruiterJobsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const jobs = await prisma.job.findMany({
    where: { recruiterId: userId },
    include: {
      _count: {
        select: { applications: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Job Listings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of your active, draft, and closed position requisitions.
          </p>
        </div>

        <Button asChild className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
          <Link href="/dashboard/recruiter/jobs/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Post New Job
          </Link>
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
            <h3 className="text-lg font-semibold text-foreground">No jobs posted yet</h3>
            <p className="text-sm mt-1">Create your first job requisition to start receiving applicant resumes.</p>
            <Button asChild className="mt-6 bg-violet-600 text-white">
              <Link href="/dashboard/recruiter/jobs/create">Post New Job</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="border-border/50 bg-card">
              <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg hover:text-violet-600 transition-colors">
                      <Link href={`/jobs/${job.slug}`}>{job.title}</Link>
                    </h3>
                    <Badge variant={job.status === 'PUBLISHED' ? 'default' : 'secondary'} className="text-[10px]">
                      {job.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span>{job.category}</span>
                    <span>•</span>
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>{job.jobType.replace('_', ' ')}</span>
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1 font-semibold text-violet-600">
                      <Users className="h-3.5 w-3.5" /> {job._count.applications} Applicants
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" /> {job.viewsCount} Views
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Posted {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t sm:border-t-0 pt-4 sm:pt-0">
                  <Button asChild variant="outline" size="sm" className="text-xs">
                    <Link href={`/dashboard/recruiter/applicants?jobId=${job.id}`}>
                      View Applicants ({job._count.applications})
                    </Link>
                  </Button>

                  <JobDeleteButton jobId={job.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
