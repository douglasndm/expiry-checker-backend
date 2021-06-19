import AppError from '@errors/AppError';
import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

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

            return next();
        } catch (err) {
            throw new AppError('Unauthorized', 403);
        }
    }

    throw new AppError('Unauthorized', 403);
}
