const redis = require("redis");

const redisClient = redis.createClient({
  socket: { host: process.env.REDIS_HOST, port: 6379 }
});

redisClient.connect().catch(console.error);

const setCache = async (key, value, ttl = 600) => {
  await redisClient.set(key, JSON.stringify(value), { EX: ttl });
};

const getCache = async (key) => {
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
};

module.exports = { setCache, getCache };
