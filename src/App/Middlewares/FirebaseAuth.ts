import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

import AppError from '@errors/AppError';

export default async function checkFirebaseAuth(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void | Response> {
    if (req.headers.authorization) {
        try {
            const [, token] = req.headers.authorization.split(' ');

            const auth = admin.auth();
            const verifyToken = await auth.verifyIdToken(token);

            req.userId = verifyToken.uid;
            req.userEmail = verifyToken.email;

            if (!verifyToken.email) {
                throw new AppError({
                    message: 'User does not have email registred',
                    statusCode: 400,
                });
            }

            return next();
        } catch (err) {
            throw new AppError({
                message: 'Unauthorized',
                statusCode: 403,
                internalErrorCode: 3,
            });
        }
    }

    throw new AppError({
        message: 'Unauthorized',
        statusCode: 403,
        internalErrorCode: 3,
    });
}
