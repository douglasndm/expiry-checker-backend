import IORedis from 'ioredis';

const redisClient = new IORedis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASS || undefined,

    maxRetriesPerRequest: 30,
    enableReadyCheck: false,
});

const redisOptions = redisClient.options;

export { redisClient, redisOptions };
