import Redis from "ioredis";
const globalForRedis = globalThis as unknown as {
  redis?: Redis;
};
const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL ?? "redis://127.0.0.1:6379", {
    lazyConnect: false,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
  });
if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
export const AUDIT_QUEUE = "audit_queue";
export async function logAuditEvent(
  action: string,
  userId: string,
  details: unknown,
): Promise<void> {
  const event = {
    action,
    userId,
    details,
    timestamp: new Date().toISOString(),
  };
  await redis.lpush(AUDIT_QUEUE, JSON.stringify(event));
}
