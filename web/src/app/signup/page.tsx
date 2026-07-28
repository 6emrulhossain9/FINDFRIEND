import Link from "next/link";

import { SignupForm } from "./SignupForm";

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center gap-6 px-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Already have one?{" "}
          <Link href="/login" className="font-medium underline">
            Sign in
          </Link>
          .
        </p>
      </div>

      <SignupForm />
    </main>
  );
}
