import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CareerWorkspaceHeader } from '@/components/career-workspace/career-workspace-header';

export default function LearningLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <CareerWorkspaceHeader
        title="My Learning"
        description="Your personalized learning roadmap driven by authentic problem submissions, weak topic detection, and mock interview performance."
        action={<Skeleton className="h-9 w-36 rounded-md" />}
      />

      {/* Recommended Focus Card Skeleton */}
      <Card>
        <CardHeader className="pb-3 border-b border-border space-y-1.5">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-64" />
        </CardHeader>
        <CardContent className="p-5 space-y-3">
          <Skeleton className="h-4 w-full max-w-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-md bg-muted/40 border border-border space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Roadmap Sequence Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <Card key={i} className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-1.5 w-full rounded-full" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
