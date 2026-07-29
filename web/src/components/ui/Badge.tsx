/** Notification badge — dot with optional count */

interface BadgeProps {
  count?: number;
  dot?: boolean;
  className?: string;
}

export function Badge({ count, dot = false, className = "" }: BadgeProps) {
  // Dot mode: just a small indicator
  if (dot && (count === undefined || count === 0)) {
    return (
      <span
        className={`absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-danger animate-scale-in ${className}`}
      />
    );
  }

  // Count mode: show number (up to 99+)
  if (count && count > 0) {
    return (
      <span
        className={`absolute -right-2 -top-1.5 flex min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-tight text-white animate-scale-in ${className}`}
      >
        {count > 99 ? "99+" : count}
      </span>
    );
  }

  return null;
}
