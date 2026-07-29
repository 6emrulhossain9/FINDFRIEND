// ReportButton — Apple-style dialog to collect a reason + description

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
        className="w-full rounded-full border border-border-base px-5 py-2.5 text-sm font-medium text-text-main transition-fast hover:bg-surface-hover active:scale-[0.95]"
      >
        Report
      </button>

      <dialog
        ref={dialogRef}
        className="w-full max-w-md rounded-xl border-0 bg-surface-card p-6 shadow-dropdown backdrop:bg-black/40 dark:border-0"
      >
        <h2 className="text-lg font-semibold text-text-main">Report this user</h2>
        <p className="mt-1 text-xs text-text-soft">
          Reports are reviewed by the team. We never tell the user who reported
          them.
        </p>

        <form action={formAction} className="mt-4 flex flex-col gap-4 text-sm">
          <input type="hidden" name="reported_user_id" value={targetUserId} />

          <fieldset className="flex flex-col gap-2">
            <legend className="font-medium text-text-main">Reason</legend>
            {REASONS.map((r) => (
              <label key={r.value} className="flex items-center gap-2 text-text-main">
                <input
                  type="radio"
                  name="reason"
                  value={r.value}
                  required
                  disabled={pending}
                  className="border-border-base text-accent accent-accent"
                />
                <span>{r.label}</span>
              </label>
            ))}
            {state && state.ok === false && state.errors?.reason && (
              <p className="text-xs text-danger">
                {state.errors.reason.join(", ")}
              </p>
            )}
          </fieldset>

          <label className="flex flex-col gap-1">
            <span className="font-medium text-text-main">What happened? (optional)</span>
            <textarea
              name="description"
              rows={4}
              maxLength={1000}
              placeholder="Share any context that helps our team review this."
              disabled={pending}
              className="resize-none rounded-xl border border-border-base bg-surface px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-accent/30 disabled:opacity-60 placeholder:text-text-soft"
            />
            {state && state.ok === false && state.errors?.description && (
              <p className="text-xs text-danger">
                {state.errors.description.join(", ")}
              </p>
            )}
          </label>

          {state && state.ok === false && state.message && (
            <p className="text-xs text-danger">{state.message}</p>
          )}
          {state && state.ok === true && (
            <p className="text-xs text-success">Report submitted. Thank you.</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              disabled={pending}
              className="rounded-full border border-border-base px-5 py-2.5 text-sm font-medium text-text-main transition-fast hover:bg-surface-hover active:scale-[0.95]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-fast hover:bg-accent-dark active:scale-[0.95] disabled:opacity-50"
            >
              {pending ? "Submitting…" : "Submit report"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
