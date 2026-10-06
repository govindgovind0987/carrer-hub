import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CareerWorkspaceHeader } from '@/components/career-workspace/career-workspace-header';

export default function ProfileLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <CareerWorkspaceHeader
        title="My Profile"
        description="Manage your personal details, career history, education, skills, and portfolio links."
      />

      {/* Tabs list skeleton */}
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-9 rounded-md" />
        ))}
      </div>

      {/* Form Content Skeleton */}
      <Card>
        <CardHeader className="pb-3 border-b border-border space-y-1.5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-64" />
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-4 pb-2">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-20 w-full rounded-md" />
          </div>
          <Skeleton className="h-9 w-32 rounded-md" />
        </CardContent>
      </Card>
    </div>
  );
}
