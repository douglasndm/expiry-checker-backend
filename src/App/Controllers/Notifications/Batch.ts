import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';
import admin from 'firebase-admin';

import AppError from '@errors/AppError';

import { Batch } from '@models/Batch';
import { Product } from '@models/Product';
import UserDevice from '@models/UserDevice';

import { getUserRole } from '@utils/Users/UserRoles';
import { getAllUsersByTeam } from '@utils/Teams';

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
        const prodRepository = getRepository(Product);
        const usersDevicesRepo = getRepository(UserDevice);

        const batch = await batchRepository
            .createQueryBuilder('batch')
            .leftJoinAndSelect('batch.product', 'product')
            .leftJoinAndSelect('product.team', 'prodTeams')
            .leftJoinAndSelect('prodTeams.team', 'team')
            .where('batch.id = :batch_id', { batch_id })
            .getOne();

        if (!batch) {
            throw new AppError({
                message: 'Batch not found',
                statusCode: 400,
                internalErrorCode: 9,
            });
        }

        // temp
        const team_id = batch.product.team[0].team.id;

        const userRole = await getUserRole({
            user_id: req.userId,
            team_id,
        });

        if (userRole !== 'Manager' && userRole !== 'Supervisor') {
            throw new AppError({
                message: "You don't have authorization to do this",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const usersInTeam = await getAllUsersByTeam({
            team_id,
        });

        const usersIds = usersInTeam.map(user => user.id);

        const usersDevices = await usersDevicesRepo
            .createQueryBuilder('device')
            .where('device.user_id IN(:...usersIds)', { usersIds })
            .getMany();

        const messaging = admin.messaging();

        const messages = [];

        messages.push({
            notification: {
                title: 'Check this product',
                body: `${batch.name}`,
            },
            token: usersDevices[0].device_id,
        });

        await messaging.sendAll(messages);

        return res.status(204).send();
    }
}

export default new BatchNotificationController();
