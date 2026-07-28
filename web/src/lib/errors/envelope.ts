// Error envelope — the ONLY shape we return to the client on failures.
//
// { code, message, requestId, details? }
//
// `details` is optional. It is reserved for machine-readable extras (e.g.
// per-field validation errors). It is NEVER used to leak server stack traces,
// SQL error text, or environment info.
//
// Server-side, `toEnvelope(error, requestId)` is the one place that knows
// how to map unknown errors to the envelope. All other layers should throw
// an AppError and let the boundary handle it.

import { AppError, type ErrorCode } from "./classes";
import { newRequestId } from "./request-id";

export type ErrorEnvelope = {
  code: ErrorCode | "INTERNAL";
  message: string;
  requestId: string;
  details?: Record<string, unknown>;
};

export function toEnvelope(err: unknown, requestId: string): ErrorEnvelope {
  if (err instanceof AppError) {
    return {
      code: err.code,
      message: err.message,
      requestId,
    };
  }
  // Unknown error — hide details. Server-side log is responsible for `err`.
  return {
    code: "INTERNAL",
    message: "Something went wrong. Please try again.",
    requestId,
  };
}

export function newEnvelope(
  code: ErrorCode | "INTERNAL",
  message: string,
  details?: Record<string, unknown>,
): ErrorEnvelope {
  return {
    code,
    message,
    requestId: newRequestId(),
    details,
  };
}
