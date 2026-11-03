"use client";

import { useActionState, useState } from "react";

import { signupAction } from "@/app/actions/auth";
import type { AuthFormState } from "@/lib/validation/auth";

const initialState: AuthFormState = undefined;

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);
  const [birthDate, setBirthDate] = useState({ month: "", day: "", year: "" });
  const showFieldErrors = (f: "email" | "password" | "date_of_birth") =>
    state && state.ok === false ? state.errors?.[f] : undefined;

  // Calculate max date (13 years ago) for the date input
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 13);
  const firstBirthYear = new Date().getFullYear() - 120;
  const birthYears = Array.from(
    { length: maxDate.getFullYear() - firstBirthYear + 1 },
    (_, index) => String(maxDate.getFullYear() - index),
  );
  const birthDays = birthDate.month && birthDate.year
    ? new Date(Number(birthDate.year), Number(birthDate.month), 0).getDate()
    : 31;
  const birthDateValue = birthDate.month && birthDate.day && birthDate.year
    ? `${birthDate.year}-${birthDate.month.padStart(2, "0")}-${birthDate.day.padStart(2, "0")}`
    : "";

  function updateBirthDate(part: "month" | "day" | "year", value: string) {
    setBirthDate((current) => {
      const next = { ...current, [part]: value };
      if (next.month && next.year) {
        const daysInMonth = new Date(Number(next.year), Number(next.month), 0).getDate();
        if (next.day && Number(next.day) > daysInMonth) next.day = "";
      }
      return next;
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          className="min-h-11 rounded-xl border border-border-base bg-surface px-4 py-2.5 outline-none transition-fast focus:border-accent focus:ring-2 focus:ring-accent/15"
        />
        {showFieldErrors("email")?.map((e) => (
          <p key={e} className="text-xs text-danger">{e}</p>
        ))}
      </label>

      <fieldset className="flex flex-col gap-1 text-sm" aria-describedby="birth-date-help">
        <legend className="font-medium">Birthday</legend>
        <input type="hidden" name="date_of_birth" value={birthDateValue} />
        <div className="grid grid-cols-[1.35fr_0.8fr_1fr] gap-2">
          <select
            aria-label="Birth month"
            autoComplete="bday-month"
            required
            value={birthDate.month}
            onChange={(event) => updateBirthDate("month", event.currentTarget.value)}
            className="min-h-12 min-w-0 rounded-xl border border-border-base bg-surface px-3 text-sm outline-none transition-fast focus:border-accent focus:ring-2 focus:ring-accent/15"
          >
            <option value="">Month</option>
            {[
              "January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December",
            ].map((month, index) => (
              <option key={month} value={String(index + 1)}>{month}</option>
            ))}
          </select>
          <select
            aria-label="Birth day"
            autoComplete="bday-day"
            required
            value={birthDate.day}
            onChange={(event) => updateBirthDate("day", event.currentTarget.value)}
            className="min-h-12 min-w-0 rounded-xl border border-border-base bg-surface px-3 text-sm outline-none transition-fast focus:border-accent focus:ring-2 focus:ring-accent/15"
          >
            <option value="">Day</option>
            {Array.from({ length: birthDays }, (_, index) => String(index + 1)).map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
          <select
            aria-label="Birth year"
            autoComplete="bday-year"
            required
            value={birthDate.year}
            onChange={(event) => updateBirthDate("year", event.currentTarget.value)}
            className="min-h-12 min-w-0 rounded-xl border border-border-base bg-surface px-3 text-sm outline-none transition-fast focus:border-accent focus:ring-2 focus:ring-accent/15"
          >
            <option value="">Year</option>
            {birthYears.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
        {showFieldErrors("date_of_birth")?.map((e) => (
          <p key={e} className="text-xs text-danger" role="alert">{e}</p>
        ))}
        <p id="birth-date-help" className="text-xs leading-5 text-text-tertiary">
          Used to confirm you’re 13 or older. Your birthday isn’t shown on your profile.
        </p>
      </fieldset>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Password</span>
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="min-h-11 rounded-xl border border-border-base bg-surface px-4 py-2.5 outline-none transition-fast focus:border-accent focus:ring-2 focus:ring-accent/15"
        />
        {showFieldErrors("password")?.map((e) => (
          <p key={e} className="text-xs text-danger">{e}</p>
        ))}
        <p className="text-xs text-text-tertiary">
          8+ characters, with at least one letter and one number.
        </p>
      </label>

      {state && state.ok === false && state.message ? (
        <p className="text-sm text-danger" role="alert">{state.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-fast hover:bg-accent-dark active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
