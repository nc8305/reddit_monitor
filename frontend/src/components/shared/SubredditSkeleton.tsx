import { Card, CardContent, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export function SubredditSkeleton() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            {/* Title Skeleton */}
            <Skeleton className="h-6 w-32 mb-2" />
            {/* Activity Level Skeleton */}
            <Skeleton className="h-4 w-24" />
          </div>
          {/* Risk Indicator Skeleton */}
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <Skeleton className="h-3 w-40 mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
          
          <div>
            <Skeleton className="h-3 w-36 mb-2" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>

          <Skeleton className="h-5 w-28" />
        </div>
      </CardContent>
    </Card>
  );
}