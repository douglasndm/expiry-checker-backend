import { NextFunction, Request, Response } from 'express';
import admin from 'firebase-admin';

import { firebaseApp, firebaseAppExpiryChecker } from '@services/Firebase';

import AppError from '@errors/AppError';

async function appChecker(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    let appCheckToken = req.header('X-Firebase-AppCheck');

    if (!appCheckToken) {
        appCheckToken = req.header('x-firebase-appcheck');
    }

    if (!appCheckToken) {
        throw new AppError({
            message: 'AppChecker ID was not send',
            statusCode: 401,
        });
    }

    try {
        await admin.appCheck(firebaseApp).verifyToken(appCheckToken);
        return next();
    } catch (err) {
        // If appCheck fails with the teams tokens, try with the expiry checker app
        try {
            await admin
                .appCheck(firebaseAppExpiryChecker)
                .verifyToken(appCheckToken);
            return next();
        } catch (error) {
            throw new AppError({
                message: 'Invalid AppChecker ID',
                statusCode: 401,
            });
        }
    }
}

export default appChecker;
