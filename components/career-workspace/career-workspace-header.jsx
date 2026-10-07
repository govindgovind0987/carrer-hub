'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FileText, BookOpen, TrendingUp, User, LayoutGrid } from 'lucide-react';

const workspaceNavItems = [
  { label: 'Overview', href: '/dashboard/career-workspace', icon: LayoutGrid },
  { label: 'My Resumes', href: '/dashboard/resumes', icon: FileText },
  { label: 'My Learning', href: '/dashboard/learning', icon: BookOpen },
  { label: 'Skill Progress', href: '/dashboard/skill-progress', icon: TrendingUp },
  { label: 'My Profile', href: '/dashboard/profile', icon: User },
];

export function CareerWorkspaceHeader({
  title = 'My Workspace',
  description = 'Manage your professional resumes, learning sequence, technical skill growth, and public profile.',
  showTitle = true,
  action,
  className,
}) {
  const pathname = usePathname();

  return (
    <div className={cn('space-y-4 pb-5 border-b border-border mb-6', className)}>
      {showTitle && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            {description && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {description}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      {/* Clean header tabs navigation */}
      <nav
        aria-label="My Workspace Navigation"
        className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none"
      >
        {workspaceNavItems.map((item) => {
          const isActive =
            item.href === '/dashboard/career-workspace'
              ? pathname === '/dashboard/career-workspace'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors border',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/80 border-transparent hover:border-border/60'
              )}
            >
              <item.icon className="h-3.5 w-3.5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
