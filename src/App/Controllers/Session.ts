import { Request, Response } from 'express';
import * as admin from 'firebase-admin';

import { getUserByFirebaseId } from '@utils/User/Find';
import { registerDevice } from '@utils/User/Login';
import { createUser } from '@utils/User/Create';

import AppError from '@errors/AppError';
import { getTeamFromUser } from '@utils/User/Team';
import { getSubscriptionFromTeam } from '@utils/Team/Subscription/Get';
import { compareAsc, endOfDay } from 'date-fns';

class SessionController {
    async store(req: Request, res: Response): Promise<Response> {
        if (!req.userId || !req.userEmail) {
            throw new AppError({
                message: 'Provide the user id and email',
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        try {
            await getUserByFirebaseId(req.userId);
        } catch (err) {
            if (err instanceof AppError) {
                if (err.errorCode === 7) {
                    await createUser({
                        firebaseUid: req.userId,
                        email: req.userEmail,
                    });
                }
            }
        }

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

                const { firebaseToken } = req.body;

                const user = await getUserByFirebaseId(req.userId);

                await registerDevice({
                    user_id: user.id,
                    device_id: String(device_id),
                    ip_address: req.socket.remoteAddress,
                    firebaseToken,
                });

                const userTeam = await getTeamFromUser(user.id);

                const team = { ...userTeam };

                if (userTeam) {
                    const sub = await getSubscriptionFromTeam(userTeam.team.id);

                    let isActive = false;

                    if (sub) {
                        if (
                            compareAsc(
                                endOfDay(new Date()),
                                endOfDay(sub.expireIn),
                            ) <= 0
                        ) {
                            isActive = true;
                        }
                    }

                    team.team.isActive = isActive;
                }

                const response = {
                    ...user,
                    team,
                };

                return res.status(201).json(response);
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
