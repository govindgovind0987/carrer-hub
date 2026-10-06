import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function AIAnalysisLoading() {
  return (
    <div className="space-y-8 pb-12 animate-in fade-in-50 duration-200">
      {/* Header Banner Skeleton */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-64 rounded-md" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <Skeleton className="h-4 w-72 sm:w-96 rounded-md" />
      </div>

      {/* Resume Select / Action Card Skeleton */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5 w-full sm:w-auto">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-full sm:w-64 rounded-md" />
          </div>
          <Skeleton className="h-9 w-36 rounded-md shrink-0" />
        </div>
      </Card>

      {/* Main Analysis Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 space-y-4">
          <Skeleton className="h-5 w-36" />
          <div className="flex justify-center py-4">
            <Skeleton className="h-28 w-28 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <Skeleton className="h-5 w-44" />
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3.5 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
