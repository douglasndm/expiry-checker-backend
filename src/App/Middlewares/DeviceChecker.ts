import { Request, Response, NextFunction } from 'express';

import { getUserByFirebaseId } from '@utils/User/Find';
import { getUserDevice } from '@utils/User/Login';

import AppError from '@errors/AppError';

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

    const user = await getUserByFirebaseId(req.userId);
    const userLogin = await getUserDevice({ user_id: user.id });

    if (!userLogin || userLogin.deviceId !== device_id) {
        throw new AppError({
            message: 'Device is not allowed, please make login again',
            statusCode: 403,
            internalErrorCode: 22,
        });
    }

    return next();
}
