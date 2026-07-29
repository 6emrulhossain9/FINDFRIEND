/** Reusable card wrapper with optional padding and hover effect */

interface CardProps {
  children: React.ReactNode;
  hover?: boolean;
  padding?: "none" | "sm" | "md";
  className?: string;
}

const paddingClasses: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
};

export function Card({
  children,
  hover = false,
  padding = "md",
  className = "",
}: CardProps) {
  return (
    <div
      className={`card ${paddingClasses[padding]} ${hover ? "card-hover" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
