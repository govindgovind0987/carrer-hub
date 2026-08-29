import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export const metadata = {
  title: '403 — Forbidden',
};

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
          <ShieldAlert className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-6xl font-bold tracking-tight text-destructive">
          403
        </h1>
        <h2 className="mt-4 text-xl font-semibold">Forbidden</h2>
        <p className="mt-3 text-muted-foreground">
          You don&apos;t have permission to access this resource. If you believe
          this is an error, please contact your administrator.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button
            asChild
          >
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
