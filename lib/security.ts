type RateEntry = {
  count: number;
  resetAt: number;
};

const memoryStore = new Map<string, RateEntry>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;
const MAX_INPUT_LENGTH = 4000;

export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  const realIp = headers.get("x-real-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

export function rateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const existing = memoryStore.get(ip);

  if (!existing || now > existing.resetAt) {
    memoryStore.set(ip, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });

    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_WINDOW - 1,
      retryAfterSeconds: Math.ceil(WINDOW_MS / 1000),
    };
  }

  if (existing.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  memoryStore.set(ip, existing);

  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - existing.count,
    retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
  };
}

export function validateUserText(value: unknown): string | null {
  if (typeof value !== "string") {
    return "Please enter your situation in text form.";
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return "Input cannot be empty.";
  }

  if (trimmed.length > MAX_INPUT_LENGTH) {
    return `Input is too long. Maximum ${MAX_INPUT_LENGTH} characters.`;
  }

  return null;
}

export function containsBlockedContent(value: string): boolean {
  const lowered = value.toLowerCase();

  const blockedPatterns = [
    "ignore previous instructions",
    "disregard previous instructions",
    "repeat your system prompt",
    "show hidden prompt",
    "reveal system prompt",
    "developer message",
    "jailbreak",
  ];

  return blockedPatterns.some((pattern) => lowered.includes(pattern));
}