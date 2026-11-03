import { resendSignupConfirmationAction } from "@/app/actions/resend-signup-confirmation";

// Shown after sign-up when email confirmation is required.
export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ resent?: string }>;
}) {
  const { resent } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">Check your email</h1>
      <p className="text-text-soft">
        We sent a confirmation link to the address you signed up with. Click
        the link in that email to finish creating your account.
      </p>
      <p className="text-sm text-text-tertiary">
        Didn&apos;t get it? Check your spam folder, or try again in a minute.
      </p>
      <section className="mt-4 flex w-full flex-col gap-3 text-left">
        <h2 className="text-base font-medium">Need a fresh link?</h2>
        {resent === "1" ? (
          <p className="text-sm text-text-soft" role="status" aria-live="polite">
            If that address has an unconfirmed account, a fresh link is on its
            way. Check your inbox and spam folder.
          </p>
        ) : null}
        <form action={resendSignupConfirmationAction} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Email address</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              className="rounded-xl border border-border-base bg-surface px-4 py-2.5 outline-none focus:ring-1 focus:ring-accent/30"
            />
          </label>
          <button
            type="submit"
            className="rounded-full border border-border-base px-5 py-2.5 text-sm font-medium text-text-main transition-fast hover:bg-surface-hover"
          >
            Resend confirmation email
          </button>
        </form>
      </section>
    </main>
  );
}
