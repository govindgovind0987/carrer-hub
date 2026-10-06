import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CareerWorkspaceHeader } from '@/components/career-workspace/career-workspace-header';

export default function SkillProgressLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <CareerWorkspaceHeader
        title="Skill Progress"
        description="Monitor your skill levels, accuracy rates, and solved metrics across 20 Data Structures & Algorithms topics, programming languages, and interview readiness."
        action={<Skeleton className="h-9 w-36 rounded-md" />}
      />

      {/* Category Tabs Skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* 20 DSA Topics Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
            <div className="flex justify-between pt-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-12" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
