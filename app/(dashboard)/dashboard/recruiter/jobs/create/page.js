'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PlusCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createJob } from '@/actions/job';
import { jobSchema } from '@/schemas/job';
import Link from 'next/link';

export default function CreateJobPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      category: 'Software Engineering',
      location: 'Remote',
      jobType: 'FULL_TIME',
      experienceLevel: 'MID_LEVEL',
      salaryCurrency: 'USD',
      description: '',
      requirements: '',
      status: 'PUBLISHED',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await createJob(data);
      if (res.success) {
        toast.success('Job requisition posted successfully!');
        router.push('/dashboard/recruiter/jobs');
      } else {
        toast.error(res.error || 'Failed to post job');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/recruiter/jobs"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Jobs</Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Post New Requisition</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new job posting to attract qualified candidate applications.
        </p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Job Posting Details</CardTitle>
          <CardDescription>Fill out position requirements, compensation, and location specs.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="j-title">Position Title</Label>
              <Input id="j-title" placeholder="e.g. Lead Full Stack Engineer" {...register('title')} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input placeholder="Software Engineering" {...register('category')} />
                {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input placeholder="San Francisco, CA or Remote" {...register('location')} />
                {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Job Type</Label>
                <Select defaultValue="FULL_TIME" onValueChange={(val) => setValue('jobType', val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">Full Time</SelectItem>
                    <SelectItem value="PART_TIME">Part Time</SelectItem>
                    <SelectItem value="CONTRACT">Contract</SelectItem>
                    <SelectItem value="INTERNSHIP">Internship</SelectItem>
                    <SelectItem value="REMOTE">100% Remote</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Select defaultValue="MID_LEVEL" onValueChange={(val) => setValue('experienceLevel', val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENTRY_LEVEL">Entry Level</SelectItem>
                    <SelectItem value="MID_LEVEL">Mid Level</SelectItem>
                    <SelectItem value="SENIOR_LEVEL">Senior Level</SelectItem>
                    <SelectItem value="LEAD">Lead / Manager</SelectItem>
                    <SelectItem value="EXECUTIVE">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Minimum Salary ($ / yr)</Label>
                <Input type="number" placeholder="120000" {...register('salaryMin')} />
              </div>

              <div className="space-y-2">
                <Label>Maximum Salary ($ / yr)</Label>
                <Input type="number" placeholder="160000" {...register('salaryMax')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Posting Status</Label>
              <Select defaultValue="PUBLISHED" onValueChange={(val) => setValue('status', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLISHED">Published (Active)</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Position Description</Label>
              <Textarea rows={6} placeholder="Detailed role description, team mission, responsibilities..." {...register('description')} />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Candidate Requirements & Qualifications</Label>
              <Textarea rows={5} placeholder="Required skills, years of experience, technical stack..." {...register('requirements')} />
              {errors.requirements && <p className="text-xs text-destructive">{errors.requirements.message}</p>}
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />} Publish Requisition
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
