import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Download,
  CheckCircle2,
  XCircle,
  FileCode,
} from 'lucide-react';

export default async function RecruiterAssessmentDetailPage({ params }) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== 'RECRUITER' && session.user.role !== 'ADMIN')) {
    redirect('/dashboard');
  }

  const { id } = await params;

  const assessment = await prisma.recruiterAssessment.findUnique({
    where: { id },
    include: {
      candidateResults: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!assessment) {
    notFound();
  }

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-violet-500/10 text-violet-600 border-violet-500/30 text-xs">
              Access Code: {assessment.accessCode}
            </Badge>
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs">
              {assessment.status}
            </Badge>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">{assessment.title}</h1>
          <p className="text-xs text-muted-foreground">
            Duration: {assessment.timeLimitMinutes} Mins | Passing Score: {assessment.passingScore}%
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="text-xs">
            <Download className="mr-1.5 h-3.5 w-3.5" /> Download Full Summary Report
          </Button>
        </div>
      </div>

      {/* Candidate Submissions & Plagiarism View */}
      <Card className="border-border/60 bg-card/80 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Candidate Submissions & Integrity Audit</CardTitle>
          <CardDescription className="text-xs">
            Monitor real-time candidate scores, submitted code, and AI plagiarism flags
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/40">
            {assessment.candidateResults.length > 0 ? (
              assessment.candidateResults.map((result) => (
                <div key={result.id} className="p-5 space-y-4 hover:bg-muted/20 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{result.candidateName}</h4>
                      <p className="text-xs text-muted-foreground">{result.candidateEmail}</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Score:</span>
                        <span className={`font-bold ${result.totalScore >= assessment.passingScore ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {result.totalScore} / {result.maxScore} PTS
                        </span>
                      </div>

                      <div>
                        <span className="text-muted-foreground block text-[10px]">Plagiarism Flag:</span>
                        {result.plagiarismScore > 30 ? (
                          <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/30 text-[10px] font-bold">
                            <AlertTriangle className="h-3 w-3 mr-1" /> {result.plagiarismScore}% Flagged
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">
                            <ShieldCheck className="h-3 w-3 mr-1" /> {result.plagiarismScore}% Clear
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-muted-foreground space-y-2">
                <Users className="h-10 w-10 mx-auto text-muted-foreground/40" />
                <p className="text-xs">No candidate submissions recorded yet for this assessment access code.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
