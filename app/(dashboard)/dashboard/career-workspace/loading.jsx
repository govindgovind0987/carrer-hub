import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CareerWorkspaceHeader } from '@/components/career-workspace/career-workspace-header';

export default function CareerWorkspaceLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Real Career Workspace Header renders immediately */}
      <CareerWorkspaceHeader
        title="Career Workspace"
        description="Manage your professional resumes, learning sequence, technical skill growth, and public profile."
      />

      {/* 4 Pillars Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-9 w-9 rounded-md" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-9 w-full rounded-md pt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Skeleton */}
      <Card>
        <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-7 w-24" />
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between items-center py-2.5 border-b border-border/50 last:border-0">
              <div className="space-y-1">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
