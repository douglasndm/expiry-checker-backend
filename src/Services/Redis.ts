import IORedis from 'ioredis';

const redisClient = new IORedis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASS || undefined,

    maxRetriesPerRequest: null,
    enableReadyCheck: false,
});

const redisOptions = redisClient.options;

export { redisClient, redisOptions };
