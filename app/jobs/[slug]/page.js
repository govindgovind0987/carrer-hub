import { getJobBySlug } from '@/actions/job';
import { getResumes } from '@/actions/resume';
import { auth } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Building2,
  Calendar,
  Eye,
  ArrowLeft,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { JobApplyModal } from '@/components/jobs/apply-modal';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const res = await getJobBySlug(slug);
  if (!res?.job) return { title: 'Job Not Found' };
  return {
    title: `${res.job.title} at ${res.job.company?.name || 'Company'} | CareerHub`,
    description: res.job.description.slice(0, 160),
  };
}

export default async function JobDetailPage({ params }) {
  const { slug } = await params;
  const session = await auth();
  const res = await getJobBySlug(slug);

  if (!res?.job) {
    notFound();
  }

  const job = res.job;
  let userResumes = [];

  if (session?.user?.id) {
    const resResult = await getResumes();
    if (resResult.success) {
      userResumes = resResult.resumes;
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Back Button */}
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Link href="/jobs">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Jobs
            </Link>
          </Button>

          {/* Job Header Card */}
          <Card className="border-border/50 bg-card p-6 sm:p-8 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-bold text-2xl shadow-lg shrink-0">
                  {job.company?.name ? job.company.name.charAt(0) : 'C'}
                </div>
                <div className="space-y-1.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{job.title}</h1>
                  <p className="text-base font-medium text-violet-600 flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" /> {job.company?.name || 'Hiring Company'}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Badge className="bg-violet-500/10 text-violet-600 border-violet-500/20">{job.category}</Badge>
                    <Badge variant="secondary">{job.jobType.replace('_', ' ')}</Badge>
                    <Badge variant="outline">{job.experienceLevel.replace('_', ' ')}</Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-3 shrink-0">
                <JobApplyModal job={job} userResumes={userResumes} isLoggedIn={!!session?.user} />
              </div>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-border/40 text-sm">
              <div>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-violet-500" /> Location</span>
                <p className="font-semibold mt-1">{job.location}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign className="h-3.5 w-3.5 text-emerald-500" /> Salary Range</span>
                <p className="font-semibold mt-1">
                  {job.salaryMin ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax?.toLocaleString()}` : 'Competitive'}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-purple-500" /> Posted Date</span>
                <p className="font-semibold mt-1">{new Date(job.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Eye className="h-3.5 w-3.5 text-indigo-500" /> Total Views</span>
                <p className="font-semibold mt-1">{job.viewsCount} views</p>
              </div>
            </div>
          </Card>

          {/* Job Details & Company Details Split */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Description & Requirements */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border/50 p-6 space-y-4">
                <h2 className="text-xl font-bold border-b border-border/40 pb-3">Job Description</h2>
                <div className="prose dark:prose-invert text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                  {job.description}
                </div>
              </Card>

              <Card className="border-border/50 p-6 space-y-4">
                <h2 className="text-xl font-bold border-b border-border/40 pb-3">Requirements & Qualifications</h2>
                <div className="prose dark:prose-invert text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                  {job.requirements}
                </div>
              </Card>
            </div>

            {/* Sidebar: Company Info */}
            <div className="space-y-6">
              <Card className="border-border/50 p-6 space-y-4">
                <h3 className="font-bold text-base border-b border-border/40 pb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-violet-600" /> About Company
                </h3>
                <div>
                  <p className="font-bold text-base">{job.company?.name}</p>
                  {job.company?.industry && <p className="text-xs text-muted-foreground">{job.company.industry}</p>}
                </div>
                {job.company?.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed">{job.company.description}</p>
                )}
                {job.company?.website && (
                  <Button asChild variant="outline" size="sm" className="w-full text-xs mt-2">
                    <a href={job.company.website} target="_blank" rel="noreferrer">Visit Company Website</a>
                  </Button>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
