import { Brain } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className, textClassName, showText = true }) {
  return (
    <Link href="/" className={cn('flex items-center gap-2.5 group', className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs font-bold transition-colors group-hover:bg-primary/90 shrink-0">
        <Brain className="h-4.5 w-4.5" />
      </div>
      {showText && (
        <span className={cn('text-lg font-bold tracking-[-0.04em] text-foreground', textClassName)}>
          Career<span className="text-primary font-semibold">Hub</span>
        </span>
      )}
    </Link>
  );
}
