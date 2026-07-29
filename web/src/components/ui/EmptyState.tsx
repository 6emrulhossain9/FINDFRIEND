/** Empty state placeholder with icon, text, and optional action */

import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-border-base px-6 py-12 text-center animate-fade-in ${className}`}
    >
      {icon && (
        <div className="mb-4 text-4xl text-text-soft">{icon}</div>
      )}
      <h3 className="text-lg font-semibold text-text-main">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-text-soft">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
