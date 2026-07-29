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
  const [loaded, setLoaded] = useState(false);
  const sizeClass = sizeClasses[size];

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`${sizeClass} rounded-full object-cover bg-surface-hover transition-opacity duration-200 ease-out ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-surface-hover flex items-center justify-center text-text-soft font-medium ${className}`}
    >
      {fallback ?? "👤"}
    </div>
  );
}
