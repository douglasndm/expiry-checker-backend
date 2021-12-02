import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import admin from 'firebase-admin';
import { format } from 'date-fns';
import * as Yup from 'yup';

import AppError from '@errors/AppError';

import Batch from '@models/Batch';

import { getUserRole } from '@functions/Users/UserRoles';
import { getProductTeam } from '@functions/Product/Team';
import { getAllUsersFromTeam } from '@functions/Team/Users';

class BatchNotificationController {
    async store(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            batch_id: Yup.string().required().uuid(),
        });

        try {
            await schema.validate(req.params);
        } catch (err) {
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

        const userRole = await getUserRole({
            user_id: req.userId,
            team_id: team.id,
        });

        if (userRole !== 'Manager' && userRole !== 'Supervisor') {
            throw new AppError({
                message: "You don't have authorization to do this",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const usersInTeam = await getAllUsersFromTeam({
            team_id: team.id,
            includeDevices: true,
        });

        const messaging = admin.messaging();

        const messages: TokenMessage[] = [];

        const formatedDate = format(batch.exp_date, 'dd-MM-yyyy');

        const messageString = `${batch.product.name} tem um lote que vence em ${formatedDate}`;

        usersInTeam.forEach(user => {
            if (user.id !== req.userId && !!user.device) {
                messages.push({
                    notification: {
                        title: 'Verifique esse produto',
                        body: messageString,
                        data: {
                            deeplinking: `expiryteams://product/${batch.product.id}`,
                        },
                    },
                    token: user.device,
                });
            }
        });

        if (messages.length <= 0) {
            throw new AppError({
                message: 'There are no users to send',
                statusCode: 400,
                internalErrorCode: 27,
            });
        }

        await messaging.sendAll(messages);

        return res.status(204).send();
    }
}

export default new BatchNotificationController();
