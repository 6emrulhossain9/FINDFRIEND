// Per-request correlation IDs.
//
// Goals:
//   1. Every error envelope has a stable ID the client can show, and the
//      server can grep for in logs.
//   2. In server contexts the ID is stable across the lifetime of a single
//      request (route handler, server action, RSC).
//   3. We never expose internal error details — only the code + message +
//      requestId are returned to the client.
//
// Crypto: we use Web Crypto because it works in both Edge and Node runtimes,
// and is available in the browser. Avoid `crypto.randomUUID` for the server
// path because it is not always present in older Node versions; `getRandomValues`
// is universally available.

const ALPHABET = "0123456789abcdefghjkmnpqrstvwxyz"; // crockford-ish; no ambiguous chars

function randomId(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i++) {
    // safe: bytes.length === length
    out += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return out;
}

export function newRequestId(): string {
  // 16 chars ~ 78 bits of entropy, more than UUIDv4's 122 but plenty for correlation.
  return `req_${randomId(16)}`;
}
