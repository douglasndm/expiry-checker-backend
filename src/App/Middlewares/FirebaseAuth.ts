import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

import { getUserDeviceId } from '@utils/Users/Device';

export default async function checkFirebaseAuth(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void | Response> {
    if (req.headers.authorization) {
        try {
            const [, token] = req.headers.authorization.split(' ');
            const device_id = req.headers.deviceid;

            if (!device_id) {
                return res.status(403).json({ error: 'Provide the device id' });
            }

            const auth = admin.auth();
            const verifyToken = await auth.verifyIdToken(token);

            req.userId = verifyToken.uid;

            const userDevice = await getUserDeviceId({ user_id: req.userId });

            if (!userDevice || userDevice !== device_id) {
                return res.status(403).json({
                    error: 'Device is not allowed, please make login again',
                });
            }

            return next();
        } catch (err) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
    }
    return res.status(403).json({ error: 'Unauthorized' });
}
