'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { applyToJob } from '@/actions/job';
import Link from 'next/link';

export function JobApplyModal({ job, userResumes = [], isLoggedIn = false }) {
  const [open, setOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState(
    userResumes.find((r) => r.isDefault)?.id || userResumes[0]?.id || ''
  );
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);
  const router = useRouter();

  if (!isLoggedIn) {
    return (
      <Button asChild size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-lg shadow-violet-500/25 px-8">
        <Link href={`/sign-in?callbackUrl=/jobs/${job.slug}`}>Sign in to Apply</Link>
      </Button>
    );
  }

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (userResumes.length === 0) {
      toast.error('Please upload at least one resume before applying');
      router.push('/dashboard/resumes');
      return;
    }

    setSubmitting(true);
    try {
      const res = await applyToJob({
        jobId: job.id,
        resumeId: selectedResumeId,
        coverLetter,
      });

      if (res.success) {
        toast.success('Application submitted successfully!');
        setApplied(true);
        setOpen(false);
      } else {
        toast.error(res.error || 'Failed to submit application');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (applied) {
    return (
      <Button disabled className="bg-emerald-600 text-white font-semibold px-8">
        <CheckCircle2 className="mr-2 h-4 w-4" /> Application Submitted
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-violet-500/25 px-8">
          <Send className="mr-2 h-4 w-4" /> Apply Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply for {job.title}</DialogTitle>
        </DialogHeader>

        {userResumes.length === 0 ? (
          <div className="py-6 text-center space-y-4">
            <p className="text-sm text-muted-foreground">You haven&apos;t uploaded any resumes yet.</p>
            <Button asChild className="bg-violet-600 text-white">
              <Link href="/dashboard/resumes">Go to Upload Resume</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleApplySubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Select Tailored Resume</Label>
              <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a resume..." />
                </SelectTrigger>
                <SelectContent>
                  {userResumes.map((resume) => (
                    <SelectItem key={resume.id} value={resume.id}>
                      {resume.title} {resume.isDefault ? '(Default)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cover Letter / Note to Hiring Team (Optional)</Label>
              <Textarea
                rows={4}
                placeholder="Explain why you're a great fit for this position..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold">
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />} Submit Application
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
