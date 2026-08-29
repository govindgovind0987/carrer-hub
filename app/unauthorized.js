import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldX } from 'lucide-react';

export const metadata = {
  title: '401 — Unauthorized',
};

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
          <ShieldX className="h-8 w-8 text-amber-500" />
        </div>
        <h1 className="text-6xl font-bold tracking-tight text-foreground">
          401
        </h1>
        <h2 className="mt-4 text-xl font-semibold">Unauthorized</h2>
        <p className="mt-3 text-muted-foreground">
          You need to sign in to access this page. Please log in with your
          credentials to continue.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button
            asChild
          >
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
