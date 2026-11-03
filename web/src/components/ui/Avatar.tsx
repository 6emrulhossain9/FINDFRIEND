/** Reusable avatar with image fallback and size variants */

"use client";

import { useState } from "react";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  fallback?: string;
}

const sizeClasses: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-2xl",
};

export function Avatar({
  src,
  alt = "",
  size = "md",
  className = "",
  fallback,
}: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const sizeClass = sizeClasses[size];

  if (src && failedSrc !== src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        onError={() => setFailedSrc(src)}
        className={`${sizeClass} rounded-full bg-surface-hover object-cover ${className}`}
      />
    );
  }

  return (
    <div
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      className={`${sizeClass} flex items-center justify-center rounded-full bg-success-light font-semibold text-accent ${className}`}
    >
      {fallback ?? (alt.trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "F")}
    </div>
  );
}
