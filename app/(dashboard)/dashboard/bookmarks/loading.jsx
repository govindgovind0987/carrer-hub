import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function BookmarksLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div className="space-y-2">
        <Skeleton className="h-8 w-44 rounded-md" />
        <Skeleton className="h-4 w-64 rounded-md" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-5 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-8 w-full rounded-md mt-2" />
          </Card>
        ))}
      </div>
    </div>
  );
}
