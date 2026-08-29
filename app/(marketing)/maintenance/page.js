import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wrench } from 'lucide-react';

export const metadata = {
  title: 'Maintenance — CareerHub',
};

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10">
          <Wrench className="h-8 w-8 text-violet-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Under Maintenance
        </h1>
        <p className="mt-4 text-muted-foreground">
          We&apos;re performing scheduled maintenance to improve your experience.
          We&apos;ll be back shortly. Thank you for your patience.
        </p>
        <div className="mt-8">
          <Button variant="outline" asChild>
            <Link href="/">Try Again</Link>
          </Button>
        </div>
        <p className="mt-6 text-xs text-muted-foreground/60">
          Expected downtime: ~30 minutes
        </p>
      </div>
    </div>
  );
}
