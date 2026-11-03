import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { resendSignupConfirmationAction } from "@/app/actions/resend-confirmation";

export default async function CheckEmailPage({ searchParams }: { searchParams: Promise<{ resent?: string }> }) {
  const { resent } = await searchParams;
  return (
    <AuthLayout>
      <div className="flex flex-col gap-5 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-success-light text-accent"><MailCheck aria-hidden="true" className="h-7 w-7" /></span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Check your inbox</h1>
          <p className="mt-2 text-sm leading-6 text-text-soft">We sent a confirmation link to the email address you used to sign up. Open it to finish setting up your account.</p>
        </div>
        <div className="rounded-2xl bg-surface px-4 py-3 text-left text-sm leading-6 text-text-soft">If you don’t see the email soon, take a look in your spam folder.</div>
        <section className="border-t border-separator pt-5 text-left">
          <h2 className="text-sm font-semibold">Need another link?</h2>
          <p className="mt-1 text-xs leading-5 text-text-soft">Enter the same address you signed up with.</p>
          {resent === "1" ? <p className="mt-3 rounded-xl bg-success-light px-3 py-2.5 text-sm text-success" role="status" aria-live="polite">If that address has an unconfirmed account, a fresh link is on its way.</p> : null}
          <form action={resendSignupConfirmationAction} className="mt-3 flex flex-col gap-3">
            <label htmlFor="confirmation-email" className="text-sm font-medium">Email address</label>
            <input id="confirmation-email" type="email" name="email" autoComplete="email" required className="min-h-11 rounded-xl border border-border-base bg-surface-card px-4 py-2.5 text-sm outline-none transition-fast focus:border-accent focus:ring-2 focus:ring-accent/15" />
            <button type="submit" className="min-h-11 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-fast hover:bg-accent-dark">Resend confirmation email</button>
          </form>
        </section>
        <p className="text-sm text-text-soft">Already confirmed? <Link href="/login" className="font-semibold text-accent hover:underline">Sign in</Link></p>
      </div>
    </AuthLayout>
  );
}
