import IORedis, { Redis } from 'ioredis';

import { captureException } from '@services/ExceptionsHandler';

let redisClient: Redis | null = null;
let redisOptions = null;

try {
	redisClient = new IORedis({
		host: process.env.REDIS_HOST,
		port: Number(process.env.REDIS_PORT),
		username: process.env.REDIS_USER,
		password: process.env.REDIS_PASS || undefined,

		maxRetriesPerRequest: 30,
		retryStrategy(times) {
			if (times > 3) {
				return null;
			}
			return Math.min(times * 100, 3000);
		},
	});

	redisOptions = redisClient.options;
} catch (error) {
	captureException(error);

	redisClient = null;
}

export { redisClient, redisOptions };
