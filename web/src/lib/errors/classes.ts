// Typed application errors. The reason these exist as classes instead of
// raw thrown Errors is so the error boundary / route handler can pattern-match
// on `error.code` without parsing strings, and so the API envelope stays
// stable while the internal error text can be as detailed as we like.
//
// Conventions:
//   - `code` is a stable SCREAMING_SNAKE string the client can switch on.
//     Never localize. Never change once published (it's part of the API).
//   - `httpStatus` is what the server returns. Default 500.
//   - `message` is a short, user-safe string. May be shown directly to the user.
//   - `cause` is the underlying error (kept server-side only; not in the envelope).
//   - `context` is debug-only structured data (never sent to client).

export type ErrorCode =
  // 4xx — caller problems
  | "BAD_REQUEST"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "VALIDATION_FAILED"
  // 5xx — server problems
  | "INTERNAL"
  | "UPSTREAM_UNAVAILABLE"
  | "NOT_IMPLEMENTED";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly httpStatus: number;
  public readonly context?: Record<string, unknown>;
  public override readonly cause?: unknown;

  constructor(
    code: ErrorCode,
    message: string,
    opts: { httpStatus?: number; cause?: unknown; context?: Record<string, unknown> } = {},
  ) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.httpStatus = opts.httpStatus ?? defaultStatusFor(code);
    this.cause = opts.cause;
    this.context = opts.context;
  }
}

export class ValidationError extends AppError {
  constructor(
    message = "Invalid input",
    opts: { cause?: unknown; context?: Record<string, unknown> } = {},
  ) {
    super("VALIDATION_FAILED", message, { httpStatus: 422, ...opts });
  }
}

export class UnauthenticatedError extends AppError {
  constructor(message = "Sign in to continue", opts: { cause?: unknown } = {}) {
    super("UNAUTHENTICATED", message, { httpStatus: 401, ...opts });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Not allowed", opts: { cause?: unknown } = {}) {
    super("FORBIDDEN", message, { httpStatus: 403, ...opts });
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found", opts: { cause?: unknown } = {}) {
    super("NOT_FOUND", message, { httpStatus: 404, ...opts });
  }
}

export class ConflictError extends AppError {
  constructor(message = "Already exists", opts: { cause?: unknown } = {}) {
    super("CONFLICT", message, { httpStatus: 409, ...opts });
  }
}

export class RateLimitedError extends AppError {
  constructor(message = "Too many requests", opts: { cause?: unknown } = {}) {
    super("RATE_LIMITED", message, { httpStatus: 429, ...opts });
  }
}

function defaultStatusFor(code: ErrorCode): number {
  switch (code) {
    case "BAD_REQUEST":
      return 400;
    case "UNAUTHENTICATED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "NOT_FOUND":
      return 404;
    case "CONFLICT":
      return 409;
    case "RATE_LIMITED":
      return 429;
    case "VALIDATION_FAILED":
      return 422;
    case "NOT_IMPLEMENTED":
      return 501;
    case "UPSTREAM_UNAVAILABLE":
      return 502;
    case "INTERNAL":
      return 500;
  }
}
