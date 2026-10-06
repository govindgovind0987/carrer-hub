import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CareerWorkspaceHeader } from '@/components/career-workspace/career-workspace-header';

export default function ResumesLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <CareerWorkspaceHeader
        title="My Resumes"
        description="Upload multiple resume versions and manage default documents for one-click job applications."
        action={<Skeleton className="h-9 w-36 rounded-md" />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-border space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-40" />
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Skeleton className="h-8 flex-1 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
