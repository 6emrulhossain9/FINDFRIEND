// ReportButton — opens a small dialog to collect a reason + description,
// then submits to the `reportUser` server action.

"use client";

import { useActionState, useEffect, useRef } from "react";

import { reportUser } from "@/app/actions/social";
import type { SocialFormState } from "@/lib/validation/social";

interface ReportButtonProps {
  targetUserId: string;
}

const REASONS: Array<{ value: string; label: string }> = [
  { value: "harassment", label: "Harassment" },
  { value: "hate-speech", label: "Hate speech" },
  { value: "spam", label: "Spam" },
  { value: "inappropriate-content", label: "Inappropriate content" },
  { value: "underage-user", label: "Suspected underage user" },
  { value: "other", label: "Other" },
];

export function ReportButton({ targetUserId }: ReportButtonProps) {
  const [state, formAction, pending] = useActionState<SocialFormState, FormData>(
    reportUser,
    undefined,
  );
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Close the dialog on success; surface server errors inline.
  useEffect(() => {
    if (state && state.ok === true && dialogRef.current?.open) {
      dialogRef.current.close();
    }
  }, [state]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="w-full rounded-md border border-zinc-300 px-4 py-2 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
      >
        Report
      </button>

      <dialog
        ref={dialogRef}
        className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 backdrop:bg-black/50 dark:border-zinc-700 dark:bg-zinc-900"
      >
        <h2 className="text-lg font-semibold">Report this user</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Reports are reviewed by the team. We never tell the user who reported
          them.
        </p>

        <form action={formAction} className="mt-4 flex flex-col gap-4 text-sm">
          <input type="hidden" name="reported_user_id" value={targetUserId} />

          <fieldset className="flex flex-col gap-2">
            <legend className="font-medium">Reason</legend>
            {REASONS.map((r) => (
              <label key={r.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="reason"
                  value={r.value}
                  required
                  disabled={pending}
                  className="border-zinc-300"
                />
                <span>{r.label}</span>
              </label>
            ))}
            {state && state.ok === false && state.errors?.reason && (
              <p className="text-xs text-red-600">
                {state.errors.reason.join(", ")}
              </p>
            )}
          </fieldset>

          <label className="flex flex-col gap-1">
            <span className="font-medium">What happened? (optional)</span>
            <textarea
              name="description"
              rows={4}
              maxLength={1000}
              placeholder="Share any context that helps our team review this."
              disabled={pending}
              className="resize-none rounded-md border border-zinc-300 bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/30 dark:border-zinc-700"
            />
            {state && state.ok === false && state.errors?.description && (
              <p className="text-xs text-red-600">
                {state.errors.description.join(", ")}
              </p>
            )}
          </label>

          {state && state.ok === false && state.message && (
            <p className="text-xs text-red-600">{state.message}</p>
          )}
          {state && state.ok === true && (
            <p className="text-xs text-green-600">
              Report submitted. Thank you.
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              disabled={pending}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-foreground px-3 py-2 text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Submitting…" : "Submit report"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}