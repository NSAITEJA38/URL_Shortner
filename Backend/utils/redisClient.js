import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    reconnectStrategy: false
  }
});

let errorLogged = false;
redisClient.on("error", (err) => {
  if (!errorLogged) {
    console.warn("Redis client error or unavailable. Application will fallback to MongoDB only.", err.message);
    errorLogged = true;
  }
});

redisClient.on("connect", () => {
  console.log("Connected to Redis successfully.");
});

// Attempt to connect, but don't crash if it fails
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.warn("Could not establish initial Redis connection. Continuing without cache.");
  }
})();

export default redisClient;
