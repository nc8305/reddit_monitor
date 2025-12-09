import { Skeleton } from "../ui/skeleton";

export function InteractionSkeleton() {
  return (
    <div className="relative group p-4 rounded-xl border bg-card transition-all hover:shadow-md">
      <div className="flex flex-col gap-3">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {/* Type Badge */}
            <Skeleton className="h-5 w-16 rounded-full" />
            {/* Subreddit Text */}
            <Skeleton className="h-3 w-32" />
            {/* Timestamp */}
            <Skeleton className="h-3 w-16" />
          </div>
          {/* Risk Indicator */}
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        
        {/* Content Preview (Multiple lines) */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-10/12" />
        </div>

        {/* Footer Section */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {/* Sentiment Label */}
            <Skeleton className="h-3 w-16" />
            {/* Sentiment Badge */}
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          {/* View on Reddit Button */}
          <Skeleton className="h-8 w-32 rounded-md" />
        </div>
      </div>
    </div>
  );
}