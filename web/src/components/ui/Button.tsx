/** Apple pill button — follows Apple's button grammar */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "dark-utility";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-dark active:scale-[0.95] disabled:opacity-50",
  secondary:
    "bg-transparent text-accent border border-accent active:scale-[0.95] disabled:opacity-50",
  ghost:
    "bg-transparent text-text-main hover:bg-surface-hover active:scale-[0.95] disabled:opacity-50",
  danger:
    "bg-danger text-white hover:opacity-90 active:scale-[0.95] disabled:opacity-50",
  "dark-utility":
    "bg-text-main text-white active:scale-[0.95] disabled:opacity-50",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-5 py-2.5 text-sm gap-2",
  lg: "px-7 py-3 text-base gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-full font-normal transition-fast
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
