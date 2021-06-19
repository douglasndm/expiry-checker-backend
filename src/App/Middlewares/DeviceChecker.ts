import { Request, Response, NextFunction } from 'express';

import AppError from '@errors/AppError';

import { getUserDeviceId } from '@utils/Users/Device';

export default async function deviceChecker(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void | Response> {
    const device_id = req.headers.deviceid;

    if (!device_id) {
        throw new AppError('Provide the device id', 401);
    }

    if (!req.userId) {
        throw new AppError('Provide the user id', 401);
    }

    const userDevice = await getUserDeviceId({ user_id: req.userId });

    if (!userDevice || userDevice !== device_id) {
        throw new AppError(
            'Device is not allowed, please make login again',
            403,
        );
    }

    return next();
}
