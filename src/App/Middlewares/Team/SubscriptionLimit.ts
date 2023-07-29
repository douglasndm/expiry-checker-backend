import { NextFunction, Request, Response } from 'express';

import { checkMembersLimit } from '@functions/Team';

import AppError from '@errors/AppError';

async function subscriptionLimitChecker(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const { team_id } = req.params;

    const membersChecker = await checkMembersLimit({
        team_id,
    });

    if (membersChecker.members > membersChecker.limit) {
        throw new AppError({
            message: 'Team has reach the limit of members',
            statusCode: 401,
            internalErrorCode: 16,
        });
    }

    return next();
}

export default subscriptionLimitChecker;
