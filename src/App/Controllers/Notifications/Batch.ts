import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { format } from 'date-fns';
import * as Yup from 'yup';

import Batch from '@models/Batch';

import { getProductTeam } from '@functions/Product/Team';
import { getUserRoleInTeam } from '@utils/UserRoles';
import { getUserByFirebaseId } from '@utils/User/Find';
import { getAllUsersFromTeamWithDevices } from '@utils/Team/Users';
import {
    IOneSignalBatchPushNotification,
    sendNotificationByFirebase,
    sendNotificationByOneSignal,
} from '@utils/Notifications/Push/Batch';

import AppError from '@errors/AppError';

class BatchNotificationController {
    async store(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            batch_id: Yup.string().required().uuid(),
        });

        try {
            await schema.validate(req.params);
        } catch (err) {
            if (err instanceof Error)
                throw new AppError({
                    message: err.message,
                    statusCode: 400,
                    internalErrorCode: 1,
                });
        }

        if (!req.userId) {
            throw new AppError({
                message: 'Provide the user id',
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const { batch_id } = req.params;

        const batchRepository = getRepository(Batch);

        const batch = await batchRepository
            .createQueryBuilder('batch')
            .leftJoinAndSelect('batch.product', 'product')
            .leftJoinAndSelect('product.team', 'prodTeams')
            .where('batch.id = :batch_id', { batch_id })
            .getOne();

        if (!batch) {
            throw new AppError({
                message: 'Batch not found',
                statusCode: 400,
                internalErrorCode: 9,
            });
        }

        const team = await getProductTeam(batch.product);
        const user = await getUserByFirebaseId(req.userId);

        const role = await getUserRoleInTeam({
            user_id: user.id,
            team_id: team.id,
        });

        if (role !== 'manager' && role !== 'supervisor') {
            throw new AppError({
                message: "You don't have authorization to do this",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const users = await getAllUsersFromTeamWithDevices({
            team_id: team.id,
        });

        const messages: TokenMessage[] = [];

        const formatedDate = format(batch.exp_date, 'dd-MM-yyyy');
        const messageString = `${batch.product.name} tem um lote que vence em ${formatedDate}`;
        const deeplinking = `expiryteams://product/${batch.product.id}`;

        const oneSignalUsers: IOneSignalBatchPushNotification = {
            users_id: [],
            batch,
            message: messageString,
        };

        users.forEach(u => {
            if (u.firebaseUid !== req.userId) {
                // check if user made at least one login and save its token
                if (u.login) {
                    const { login } = u;
                    const token = u.login.firebaseMessagingToken;

                    if (
                        token !== undefined &&
                        token !== null &&
                        token.trim() !== ''
                    ) {
                        messages.push({
                            notification: {
                                title: 'Verifique esse produto',
                                body: messageString,
                            },
                            data: {
                                deeplinking,
                            },
                            token,
                        });
                    } else if (login.oneSignalToken) {
                        oneSignalUsers.users_id.push(u.id);
                    }
                }
            }
        });

        if (messages.length <= 0 && oneSignalUsers.users_id.length <= 0) {
            throw new AppError({
                message: 'There are no users to send',
                statusCode: 400,
                internalErrorCode: 27,
            });
        }

        if (messages.length > 0) {
            await sendNotificationByFirebase(messages);
        }

        if (oneSignalUsers.users_id.length > 0) {
            await sendNotificationByOneSignal(oneSignalUsers);
        }

        return res.status(201).send();
    }
}

export default new BatchNotificationController();
