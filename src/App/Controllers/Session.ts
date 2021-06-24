import { Request, Response } from 'express';
import * as admin from 'firebase-admin';

import { addUserDevice } from '@utils/Users/Device';
import AppError from '@errors/AppError';

class SessionController {
    async store(req: Request, res: Response): Promise<Response> {
        if (!req.headers.deviceid) {
            throw new AppError({
                message: 'Provide the device id',
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        if (req.headers.authorization) {
            try {
                const device_id = req.headers.deviceid;
                const [, token] = req.headers.authorization.split(' ');

                const auth = admin.auth();
                const verifyToken = await auth.verifyIdToken(token);

                req.userId = verifyToken.uid;

                await addUserDevice({
                    user_id: verifyToken.uid,
                    device_id: String(device_id),
                });

                return res.status(201).send();
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
}

export default new SessionController();
