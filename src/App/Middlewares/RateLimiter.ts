import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import dotenv from 'dotenv';

import { redisClient } from '@services/Redis';

import AppError from '@errors/AppError';

dotenv.config();

const limiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rateLimit',
    points: 7,
    duration: 1,
    blockDuration: 10,
});

export default async function rateLimiter(
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> {
    try {
        await limiter.consume(request.ip);

        return next();
    } catch (err) {
        throw new AppError({ message: 'Too many requests', statusCode: 429 });
    }
}
