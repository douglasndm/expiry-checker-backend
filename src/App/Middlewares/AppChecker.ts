import { NextFunction, Request, Response } from 'express';
import admin from 'firebase-admin';

import AppError from '@errors/AppError';

async function appChecker(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const appCheckToken = req.header('X-Firebase-AppCheck');
    if (!appCheckToken) {
        throw new AppError({
            message: 'AppChecker ID was not send',
            statusCode: 401,
        });
    }

    try {
        await admin.appCheck().verifyToken(appCheckToken);
        return next();
    } catch (err) {
        throw new AppError({
            message: 'Invalid AppChecker ID',
            statusCode: 401,
        });
    }
}

export default appChecker;
