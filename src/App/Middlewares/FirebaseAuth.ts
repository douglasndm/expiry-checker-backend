import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

export default async function checkFirebaseAuth(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void | Response> {
    if (req.headers.authtoken) {
        try {
            const auth = admin.auth();
            const verifyToken = await auth.verifyIdToken(req.headers.authtoken);

            req.userId = verifyToken.uid;

            return next();
        } catch (err) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
    }
    return res.status(403).json({ error: 'Unauthorized' });
}
