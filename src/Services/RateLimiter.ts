import { RateLimiterRedis } from 'rate-limiter-flexible';

import { redisClient } from '@services/Redis';

import AppError from '@errors/AppError';

const rateLimiter = new RateLimiterRedis({
	storeClient: redisClient,
	keyPrefix: 'rateLimiter',
	points: 50,
	duration: 60,
});

async function checkRateLimit(key: string): Promise<void> {
	try {
		await rateLimiter.consume(key);
	} catch (error: any) {
		if (error && error.msBeforeNext !== undefined) {
			throw new AppError({
				message: 'Too many requests',
				statusCode: 429,
			});
		}
		if (
			error &&
			error.message &&
			error.message.toLowerCase().includes('redis')
		) {
			throw new AppError({
				message: error.message,
				statusCode: 503,
			});
		}
		throw new AppError({
			message: error.message,
			statusCode: 500,
		});
	}
}

export { checkRateLimit };
