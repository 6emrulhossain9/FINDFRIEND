import Link from "next/link";

import { SignupForm } from "./SignupForm";
import { AuthLayout } from "@/components/layout/AuthLayout";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Create your account" };

export default function SignupPage() {
  return (
    <AuthLayout>
      <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="mt-2 text-sm text-text-soft">
          Already have one?{" "}
          <Link href="/login" className="font-medium underline">
            Sign in
          </Link>
          .
        </p>
      </div>

      <SignupForm />
      </div>
    </AuthLayout>
  );
}
