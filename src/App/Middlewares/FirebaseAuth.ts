import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

import { firebaseAppExpiryChecker, generateDevToken } from '@services/Firebase';

import AppError from '@errors/AppError';

export default async function checkFirebaseAuth(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void | Response> {
    if (process.env.DEV_MODE === 'true') {
        // Gerar um token de desenvolvimento
        const devToken = await generateDevToken(
            String(process.env.FIREBASE_DEV_UID),
        );
        req.headers.authorization = `Bearer ${devToken}`;

        req.userId = process.env.FIREBASE_DEV_UID;
        req.userEmail = process.env.FIREBASE_DEV_EMAIL;

        return next();
    }

    if (req.headers.authorization) {
        try {
            const [, token] = req.headers.authorization.split(' ');

            let verifyToken: DecodedIdToken | undefined;

            // First try to login using base app firebase project
            try {
                const auth = admin.auth(firebaseAppExpiryChecker);
                verifyToken = await auth.verifyIdToken(token);
            } catch (error) {
                const auth = admin.auth();
                verifyToken = await auth.verifyIdToken(token);
            }
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
            console.error(err);
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
