import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import admin from 'firebase-admin';
import { format } from 'date-fns';
import * as Yup from 'yup';
import * as Sentry from '@sentry/node';

import Batch from '@models/Batch';

import { getProductTeam } from '@functions/Product/Team';
import { getUserRoleInTeam } from '@utils/UserRoles';
import { getUserByFirebaseId } from '@utils/User/Find';

import AppError from '@errors/AppError';
import { getAllUsersFromTeamWithDevices } from '@utils/Team/Users';

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

        users.forEach(u => {
            if (u.firebaseUid !== req.userId) {
                if (u.logins[0].firebaseMessagingToken !== undefined) {
                    const firebaseToken = u.logins[0].firebaseMessagingToken;

                    if (firebaseToken && firebaseToken !== '') {
                        messages.push({
                            notification: {
                                title: 'Verifique esse produto',
                                body: messageString,
                            },
                            data: {
                                deeplinking: `expiryteams://product/${batch.product.id}`,
                            },
                            token: firebaseToken,
                        });
                    }
                }
            }
        });

        if (messages.length <= 0) {
            throw new AppError({
                message: 'There are no users to send',
                statusCode: 400,
                internalErrorCode: 27,
            });
        }

        const messaging = admin.messaging();
        const response = await messaging.sendAll(messages);

        if (response.failureCount > 0) {
            Sentry.captureException(response);
        }

        return res.status(201).send();
    }
}

export default new BatchNotificationController();
