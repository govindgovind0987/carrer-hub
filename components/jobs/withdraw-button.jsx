'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { withdrawApplication } from '@/actions/job';

export function WithdrawButton({ applicationId }) {
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async () => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    setLoading(true);
    try {
      const res = await withdrawApplication(applicationId);
      if (res.success) {
        toast.success('Application withdrawn');
      } else {
        toast.error(res.error || 'Failed to withdraw application');
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
      size="sm"
      onClick={handleWithdraw}
      disabled={loading}
      className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />} Withdraw
    </Button>
  );
}
