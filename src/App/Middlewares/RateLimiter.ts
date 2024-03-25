import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import dotenv from 'dotenv';

import { captureException } from '@services/ExceptionsHandler';
import { redisClient } from '@services/Redis';

import AppError from '@errors/AppError';

dotenv.config();

let limiter: RateLimiterRedis | undefined;

try {
    limiter = new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: 'rateLimit',
        points: 7,
        duration: 1,
        blockDuration: 10,
    });
} catch (error) {
    if (error instanceof Error) {
        captureException(error);
    }
}

export default async function rateLimiter(
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> {
    try {
        if (limiter) {
            await limiter.consume(request.ip);
        }

        return next();
    } catch (err) {
        throw new AppError({ message: 'Too many requests', statusCode: 429 });
    }
}
