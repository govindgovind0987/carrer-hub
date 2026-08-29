'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { updateApplicationStatus } from '@/actions/job';

export function StatusUpdateButton({ applicationId, currentStatus }) {
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (newStatus) => {
    setLoading(true);
    try {
      const res = await updateApplicationStatus(applicationId, newStatus);
      if (res.success) {
        toast.success(`Application status updated to ${newStatus.toLowerCase()}`);
      } else {
        toast.error(res.error || 'Failed to update status');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {currentStatus !== 'SHORTLISTED' && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleUpdate('SHORTLISTED')}
          disabled={loading}
          className="text-xs border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
        >
          Shortlist
        </Button>
      )}

      {currentStatus !== 'INTERVIEW' && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleUpdate('INTERVIEW')}
          disabled={loading}
          className="text-xs border-blue-500/30 text-blue-600 hover:bg-blue-500/10"
        >
          Invite Interview
        </Button>
      )}

      {currentStatus !== 'ACCEPTED' && (
        <Button
          size="sm"
          onClick={() => handleUpdate('ACCEPTED')}
          disabled={loading}
          className="text-xs bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Accept / Hire
        </Button>
      )}

      {currentStatus !== 'REJECTED' && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleUpdate('REJECTED')}
          disabled={loading}
          className="text-xs text-rose-600 hover:bg-rose-500/10"
        >
          Reject
        </Button>
      )}
    </div>
  );
}
