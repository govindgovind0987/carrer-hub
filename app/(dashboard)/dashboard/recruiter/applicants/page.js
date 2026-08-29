import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Users, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { StatusUpdateButton } from '@/components/jobs/status-update-button';

export const metadata = {
  title: 'Review Applicants | CareerHub',
};

export default async function RecruiterApplicantsPage({ searchParams }) {
  const session = await auth();
  const userId = session?.user?.id;
  const params = await searchParams;
  const jobId = params?.jobId || '';

  const applications = await prisma.application.findMany({
    where: {
      job: {
        recruiterId: userId,
        ...(jobId && { id: jobId }),
      },
    },
    include: {
      candidate: {
        include: {
          profile: {
            include: {
              skills: true,
              experiences: true,
            },
          },
        },
      },
      job: { select: { title: true, slug: true } },
      resume: true,
    },
    orderBy: { appliedAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Review Candidate Applicants</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Evaluate submitted candidate resumes, review candidate skills, and update hiring pipeline status.
        </p>
      </div>

      {applications.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
            <h3 className="text-lg font-semibold text-foreground">No applicants found</h3>
            <p className="text-sm mt-1">When candidates apply for your positions, their applications will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id} className="border-border/50 bg-card">
              <CardContent className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 border border-border shrink-0">
                    {app.candidate?.image && <AvatarImage src={app.candidate.image} />}
                    <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-bold">
                      {getInitials(app.candidate?.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg">{app.candidate?.name || 'Candidate'}</h3>
                      <Badge variant="outline" className="capitalize text-xs">
                        {app.status.toLowerCase()}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Applied for <span className="font-medium text-foreground">{app.job.title}</span> on {new Date(app.appliedAt).toLocaleDateString()}
                    </p>

                    {app.candidate?.profile?.headline && (
                      <p className="text-xs font-medium text-violet-600">{app.candidate.profile.headline}</p>
                    )}

                    {/* Candidate Skills preview */}
                    {app.candidate?.profile?.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {app.candidate.profile.skills.slice(0, 4).map((sk) => (
                          <Badge key={sk.id} variant="secondary" className="text-[10px] px-2 py-0">
                            {sk.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0">
                  {app.resume && (
                    <Button asChild variant="outline" size="sm" className="text-xs w-full sm:w-auto">
                      <a href={app.resume.fileUrl} target="_blank" rel="noreferrer">
                        <FileText className="mr-1.5 h-3.5 w-3.5 text-violet-600" /> View Resume PDF
                      </a>
                    </Button>
                  )}

                  <StatusUpdateButton applicationId={app.id} currentStatus={app.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
