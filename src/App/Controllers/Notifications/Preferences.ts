import { Request, Response } from 'express';
import * as Yup from 'yup';

import { defaultDataSource } from '@project/ormconfig';

import NotificationsPreferences from '@models/NotificationsPreferences';

import { getUserByFirebaseId } from '@utils/User/Find';

import AppError from '@errors/AppError';

class EmailPreferences {
    async index(req: Request, res: Response): Promise<Response> {
        if (!req.userId) {
            throw new AppError({
                message: 'Provide user id',
                internalErrorCode: 2,
            });
        }

        const user = await getUserByFirebaseId(req.userId);

        const notificationRepository = defaultDataSource.getRepository(
            NotificationsPreferences,
        );
        const settings = await notificationRepository
            .createQueryBuilder('notification')
            .leftJoinAndSelect('notification.user', 'user')
            .where('user.id = :user_id', { user_id: user.id })
            .getOne();

        if (!settings) {
            const notification = new NotificationsPreferences();

            notification.user = user;
            notification.email_enabled = false;
            notification.email_change_date = new Date();

            await notificationRepository.save(notification);

            return res.status(201).json(notification);
        }

        return res.status(200).json(settings);
    }

    async update(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            allowEmailNotification: Yup.bool().required(),
        });

        try {
            if (!req.userId) {
                throw new AppError({
                    message: 'Provide user id',
                    internalErrorCode: 2,
                });
            }
            await schema.validate(req.body);
        } catch (err) {
            throw new AppError({ message: 'Check your FID' });
        }

        const { allowEmailNotification } = req.body;

        const notificationRepository = defaultDataSource.getRepository(
            NotificationsPreferences,
        );
        const alreadyExists = await notificationRepository
            .createQueryBuilder('notification')
            .leftJoinAndSelect('notification.user', 'user')
            .where('user.firebaseUid = :user_id', { user_id: req.userId })
            .getOne();

        if (!alreadyExists) {
            const user = await getUserByFirebaseId(req.userId);

            if (!user) {
                throw new AppError({
                    message: 'User not found',
                    internalErrorCode: 7,
                });
            }

            const notification = new NotificationsPreferences();

            notification.user = user;
            notification.email_enabled = allowEmailNotification;
            notification.email_change_date = new Date();

            await notificationRepository.save(notification);
        } else {
            alreadyExists.email_enabled = allowEmailNotification;
            alreadyExists.email_change_date = new Date();

            await notificationRepository.save(alreadyExists);
        }

        return res.status(201).send();
    }
}

export default new EmailPreferences();
