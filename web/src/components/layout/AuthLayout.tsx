/** Clean Apple-style centered auth layout for login / signup pages */

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="mb-8 text-center animate-slide-up">
          <h1 className="text-3xl font-bold text-accent">ViCo</h1>
          <p className="mt-2 text-sm text-text-soft">
            Make friends around the world
          </p>
        </div>

        {/* Card containing the form */}
        <div className="apple-card p-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
          {children}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-text-tertiary">
          &copy; {new Date().getFullYear()} ViCo. All rights reserved.
        </p>
      </div>
    </div>
  );
}
