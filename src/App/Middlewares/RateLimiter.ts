import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import dotenv from 'dotenv';

import { redisClient } from '@services/Redis';
import { captureException } from '@services/ExceptionsHandler';

import AppError from '@errors/AppError';

dotenv.config();

const limiter = new RateLimiterRedis({
	storeClient: redisClient,
	keyPrefix: 'rateLimit',
	points: 7,
	duration: 1,
	blockDuration: 10,
});
async function rateLimiter(
	request: Request,
	_: Response,
	next: NextFunction
): Promise<void> {
	if (!request.ip) {
		captureException(new Error('Request IP not found'));

		throw new AppError({
			message: 'Request IP not found',
			statusCode: 429,
		});
	}

	try {
		await limiter.consume(request.ip);
	} catch (error) {
		captureException(error);
		throw new AppError({ message: 'Too many requests', statusCode: 429 });
	}
	return next();
}

export default rateLimiter;
