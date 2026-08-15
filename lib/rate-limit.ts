type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const realIp = request.headers.get("x-real-ip") ?? "";
  const firstForwarded = forwarded.split(",")[0]?.trim();
  return firstForwarded || realIp || "unknown";
}

export function rateLimitRequest(request: Request, routeKey: string, limit: number, windowMs: number) {
  const now = Date.now();
  const key = `${routeKey}:${getClientIp(request)}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true as const };
  }

  if (bucket.count >= limit) {
    return { allowed: false as const, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { allowed: true as const };
}
