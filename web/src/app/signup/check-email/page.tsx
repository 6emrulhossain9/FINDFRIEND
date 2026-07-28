// "Check your email" interstitial shown after sign-up when email
// confirmation is required. The actual account activation happens when the
// user clicks the link in the email; we don't verify anything here.

export default function CheckEmailPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">Check your email</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        We sent a confirmation link to the address you signed up with. Click
        the link in that email to finish creating your account.
      </p>
      <p className="text-sm text-zinc-500 dark:text-zinc-500">
        Didn&apos;t get it? Check your spam folder, or try again in a minute.
      </p>
    </main>
  );
}
