import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function JobMatchLoading() {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-56 rounded-md" />
        <Skeleton className="h-4 w-72 sm:w-96 rounded-md" />
      </div>

      {/* Selectors Card Skeleton */}
      <Card className="p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-end">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      </Card>

      {/* Results Placeholder Skeleton */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-lg bg-muted/40 border border-border space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-3 w-36" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
