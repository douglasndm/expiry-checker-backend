import { Request, Response, NextFunction } from 'express';

import { checkRateLimit } from '@services/RateLimiter';

import AppError from '@errors/AppError';

async function rateLimiter(
	request: Request,
	_: Response,
	next: NextFunction
): Promise<void> {
	if (!request.ip) {
		throw new AppError({
			message: 'Request IP not found',
			statusCode: 400,
		});
	}

	await checkRateLimit(request.ip);
	return next();
}

export default rateLimiter;
