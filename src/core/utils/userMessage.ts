/**
 * Sanitizes and cleans all user-facing messages.
 * Strips technical jargon (Cloudflare, Mongo, Database, Server, SQL, 500s)
 * and produces short, simple, user-friendly messages.
 */

const TECHNICAL_PATTERNS = [
  /cloudflare/i,
  /mongo/i,
  /mongodb/i,
  /database/i,
  /server/i,
  /internal\s+error/i,
  /5\d{2}/i,
  /status\s+code/i,
  /network\s+error/i,
  /econnrefused/i,
  /e11000/i,
  /timeout/i,
  /gateway/i,
  /failed\s+to\s+fetch/i,
  /exception/i,
  /sql/i,
  /query/i,
  /cors/i,
  /axios/i,
  /<!doctype/i,
  /<html/i,
  /payload/i,
  /endpoint/i,
  /unhandled/i,
  /stack\s+trace/i,
];

export function cleanUserMessage(
  raw: unknown,
  fallback: string = "Something went wrong. Please try again."
): string {
  if (!raw) return fallback;

  let msg = typeof raw === "string" ? raw : (raw as any)?.message;
  if (!msg || typeof msg !== "string") return fallback;

  msg = msg.trim();
  if (!msg) return fallback;

  // Check for any technical terms
  for (const pattern of TECHNICAL_PATTERNS) {
    if (pattern.test(msg)) {
      return fallback;
    }
  }

  // Strip excessive technical length or error stacks
  if (msg.length > 80 || msg.includes("\n") || msg.includes(" at ")) {
    return fallback;
  }

  return msg;
}
