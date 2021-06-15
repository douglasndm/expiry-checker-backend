import { Request, Response, NextFunction } from 'express';

import { getUserDeviceId } from '@utils/Users/Device';

export default async function deviceChecker(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void | Response> {
    const device_id = req.headers.deviceid;

    if (!device_id) {
        return res.status(403).json({ error: 'Provide the device id' });
    }

    if (!req.userId) {
        return res.status(403).json({ error: 'Provide the user id' });
    }

    const userDevice = await getUserDeviceId({ user_id: req.userId });

    if (!userDevice || userDevice !== device_id) {
        return res.status(403).json({
            error: 'Device is not allowed, please make login again',
        });
    }

    return next();
}
