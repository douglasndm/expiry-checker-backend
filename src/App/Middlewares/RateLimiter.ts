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
    _: Response,
    next: NextFunction,
): Promise<void> {
    try {
        if (!request.ip) {
            captureException(new Error('Request IP not found'));

            throw new AppError({
                message: 'Request IP not found',
                statusCode: 429,
            });
        }

        if (limiter) {
            await limiter.consume(request.ip);
        }

        return next();
    } catch (err) {
        if (err instanceof Error) {
            captureException(err);
            if (err.message.includes('Connection is closed')) {
                // there is a problem between app and redis (not client fauly)
                return next();
            }
        }
        throw new AppError({ message: 'Too many requests', statusCode: 429 });
    }
}
