import { Request, Response, NextFunction } from 'express';

import AppError from '@errors/AppError';

import { getUserDeviceId } from '@functions/Users/Device';

export default async function deviceChecker(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void | Response> {
    const device_id = req.headers.deviceid;

    if (!device_id) {
        throw new AppError({
            message: 'Provide the device id',
            statusCode: 401,
        });
    }

    if (!req.userId) {
        throw new AppError({ message: 'Provide the user id', statusCode: 401 });
    }

    const userDevice = await getUserDeviceId({ user_id: req.userId });

    if (!userDevice || userDevice !== device_id) {
        throw new AppError({
            message: 'Device is not allowed, please make login again',
            statusCode: 403,
            internalErrorCode: 22,
        });
    }

    return next();
}
