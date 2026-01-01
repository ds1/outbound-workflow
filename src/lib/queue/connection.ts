import { Redis } from "ioredis";

// Redis connection for BullMQ
// Uses REDIS_URL environment variable or defaults to localhost

let connection: Redis | null = null;

export function getRedisConnection(): Redis {
  if (!connection) {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

    connection = new Redis(redisUrl, {
      maxRetriesPerRequest: null, // Required for BullMQ
      enableReadyCheck: false,
    });

    connection.on("error", (err) => {
      console.error("Redis connection error:", err);
    });

    connection.on("connect", () => {
      console.log("Redis connected successfully");
    });
  }

  return connection;
}

export async function closeRedisConnection(): Promise<void> {
  if (connection) {
    await connection.quit();
    connection = null;
  }
}
