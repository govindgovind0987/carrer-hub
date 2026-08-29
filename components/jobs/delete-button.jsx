'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteJob } from '@/actions/job';

export function JobDeleteButton({ jobId }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job listing?')) return;
    setLoading(true);
    try {
      const res = await deleteJob(jobId);
      if (res.success) {
        toast.success('Job listing deleted');
      } else {
        toast.error(res.error || 'Failed to delete job');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={loading}
      className="text-destructive hover:bg-destructive/10"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
