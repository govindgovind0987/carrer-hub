import { Brain } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className, showText = true }) {
  return (
    <Link href="/" className={cn('flex items-center gap-2.5 group', className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs font-bold transition-opacity group-hover:opacity-90">
        <Brain className="h-4.5 w-4.5" />
      </div>
      {showText && (
        <span className="text-lg font-bold tracking-tight text-foreground">
          Career<span className="text-muted-foreground font-medium">Hub</span>
        </span>
      )}
    </Link>
  );
}
