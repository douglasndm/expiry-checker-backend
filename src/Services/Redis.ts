import IORedis from 'ioredis';

const redisClient = new IORedis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASS || undefined,

    maxRetriesPerRequest: 30,
    enableReadyCheck: false,
    retryStrategy(times: number) {
        if (times > 3) {
            return null;
        }
        return Math.min(times * 100, 3000);
    },
});

const redisOptions = redisClient.options;

export { redisClient, redisOptions };
