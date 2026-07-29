/** Apple-style shimmer skeleton */

interface SkeletonProps {
  variant?: "text" | "avatar" | "card" | "rect";
  className?: string;
}

const variantClasses: Record<NonNullable<SkeletonProps["variant"]>, string> = {
  text: "h-4 w-full",
  avatar: "h-10 w-10 rounded-full",
  card: "h-32 w-full rounded-xl",
  rect: "h-24 w-full rounded-xl",
};

export function Skeleton({ variant = "text", className = "" }: SkeletonProps) {
  return (
    <div
      className={`apple-shimmer ${variantClasses[variant]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

/** Pre-composed skeleton for a feed post card */
export function PostSkeleton() {
  return (
    <div className="apple-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-1/3" />
          <Skeleton className="w-1/5" />
        </div>
      </div>
      <Skeleton className="h-16" />
      <div className="flex gap-4 pt-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
    </div>
  );
}
