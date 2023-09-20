import { NextFunction, Request, Response } from 'express';

import { isSubscriptionExpired } from '@utils/Team/Subscription/IsExpired';

import AppError from '@errors/AppError';

async function subscriptionExpiredCheck(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const { team_id } = req.params;

    const expired = await isSubscriptionExpired(team_id);

    if (expired) {
        throw new AppError({
            message: 'Subscription is expired',
            statusCode: 429,
            internalErrorCode: 5,
        });
    }

    return next();
}

export default subscriptionExpiredCheck;
