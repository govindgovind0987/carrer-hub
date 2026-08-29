import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  PlusCircle,
  Users,
  Clock,
  Code2,
  FileSpreadsheet,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const metadata = {
  title: 'Recruiter Assessment Portal | CareerHub',
};

export default async function RecruiterAssessmentsPage() {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== 'RECRUITER' && session.user.role !== 'ADMIN')) {
    redirect('/dashboard');
  }

  const assessments = await prisma.recruiterAssessment.findMany({
    where: { recruiterId: session.user.id },
    include: {
      candidateResults: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recruiter Coding Assessments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create custom technical coding assessments, schedule tests, invite candidates, and view plagiarism integrity reports.
          </p>
        </div>

        <Button asChild className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-md">
          <Link href="/dashboard/recruiter/assessments/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Assessment
          </Link>
        </Button>
      </div>

      {/* Assessment List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.length > 0 ? (
          assessments.map((ast) => {
            const completedCount = ast.candidateResults.filter((c) => c.status === 'COMPLETED').length;
            return (
              <Card key={ast.id} className="border-border/60 bg-card/80 backdrop-blur-xl flex flex-col justify-between shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-violet-600 border-violet-500/30">
                      {ast.difficulty}
                    </Badge>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
                      {ast.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold pt-2">{ast.title}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2 pt-1">
                    {ast.description || 'Custom technical interview coding test.'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <div className="grid grid-cols-2 gap-2 text-xs bg-muted/40 p-3 rounded-xl border border-border/40 font-mono">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Duration:</span>
                      <span className="font-bold">{ast.timeLimitMinutes} Mins</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Access Code:</span>
                      <span className="font-bold text-violet-600">{ast.accessCode}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-violet-500" /> {ast.candidateResults.length} Candidates Invited
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {completedCount} Completed
                    </span>
                  </div>

                  <Button asChild variant="outline" className="w-full text-xs font-semibold">
                    <Link href={`/dashboard/recruiter/assessments/${ast.id}`}>
                      View Submissions & Reports <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="col-span-full border-dashed border-2 border-border/60 p-12 text-center text-muted-foreground space-y-3">
            <Code2 className="h-12 w-12 mx-auto text-violet-500/40" />
            <h3 className="font-bold text-base text-foreground">No Coding Assessments Created Yet</h3>
            <p className="text-xs max-w-sm mx-auto">
              Build custom technical assessments by selecting problems from our DSA library or adding custom interview questions.
            </p>
            <Button asChild className="bg-violet-600 text-white text-xs font-semibold">
              <Link href="/dashboard/recruiter/assessments/create">
                <PlusCircle className="mr-1.5 h-4 w-4" /> Create First Assessment
              </Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
