import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function ApplicationsLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 rounded-md" />
        <Skeleton className="h-4 w-72 rounded-md" />
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 flex justify-between items-center">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
