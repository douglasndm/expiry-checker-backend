import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { compareAsc, startOfDay } from 'date-fns';
import * as Yup from 'yup';

import User from '@models/User';

import { getUserByFirebaseId } from '@utils/User/Find';
import { createUser } from '@utils/User/Create';
import { updateUser } from '@utils/User/Update';

import { deleteUser } from '@functions/Users';

import Cache from '@services/Cache';

import AppError from '@errors/AppError';

class UserController {
    async index(req: Request, res: Response): Promise<Response> {
        if (!req.userId) {
            throw new AppError({
                message: 'Provide the user id',
                statusCode: 401,
                internalErrorCode: 1,
            });
        }

        const repository = getRepository(User);

        const user = await repository
            .createQueryBuilder('user')
            .where('user.firebaseUid = :id', { id: req.userId })
            .leftJoinAndSelect('user.roles', 'roles')
            .leftJoinAndSelect('roles.team', 'team')
            .leftJoinAndSelect('team.subscriptions', 'subscriptions')
            .getOne();

        if (!user) {
            throw new AppError({
                message: 'User not found',
                statusCode: 401,
                internalErrorCode: 7,
            });
        }

        const organizedUser = {
            id: user.firebaseUid,
            fid: user.firebaseUid,
            email: user.email,

            roles: user.roles.map(r => {
                const subscriptions = r.team.subscriptions.filter(
                    sub =>
                        compareAsc(
                            startOfDay(new Date()),
                            startOfDay(sub.expireIn),
                        ) <= 0,
                );

                return {
                    role: r.role,
                    status: r.status,
                    team: {
                        id: r.team.id,
                        name: r.team.name,
                        isActive: subscriptions.length > 0,
                    },
                };
            }),
        };

        return res.status(200).json(organizedUser);
    }

    async store(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            firebaseUid: Yup.string().required(),
            name: Yup.string(),
            lastName: Yup.string(),
            email: Yup.string().required().email(),
            password: Yup.string(),
            passwordConfirm: Yup.string().oneOf(
                [Yup.ref('password'), null],
                'Password confirmation does not match',
            ),
        });

        try {
            await schema.validate(req.body);
        } catch (err) {
            if (err instanceof Error)
                throw new AppError({
                    message: err.message,
                    internalErrorCode: 1,
                });
        }

        const { firebaseUid, email, name, lastName, password } = req.body;

        let userId = firebaseUid;

        if (req.userId) {
            userId = req.userId;
        }
        if (!userId) {
            throw new AppError({
                message: 'Provider the user id',
                statusCode: 401,
            });
        }

        const repository = getRepository(User);
        const existsUser = await repository.findOne({ where: { email } });

        if (existsUser) {
            throw new AppError({ message: 'User already exists' });
        }

        const cache = new Cache();

        const savedUser = await createUser({
            firebaseUid,
            email,
            name,
            lastName,
            password,
        });

        await cache.invalidade('users_devices');

        return res.status(201).json(savedUser);
    }

    async update(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            name: Yup.string(),
            lastName: Yup.string(),
            email: Yup.string().email(),
            password: Yup.string(),
            passwordConfirm: Yup.string().oneOf(
                [Yup.ref('password'), null],
                'Password confirmation does not match',
            ),
        });

        try {
            await schema.validate(req.body);
        } catch (err) {
            if (err instanceof Error)
                throw new AppError({
                    message: err.message,
                    internalErrorCode: 1,
                });
        }

        const { name, lastName, email, password } = req.body;

        const user = await getUserByFirebaseId(req.userId || '');

        const updatedUser = await updateUser({
            id: user.id,
            name,
            lastName,
            email,
            password,
        });

        return res.status(201).json(updatedUser);
    }

    async delete(req: Request, res: Response): Promise<Response> {
        if (!req.userId) {
            throw new AppError({
                message: 'Provider the user id',
                statusCode: 401,
            });
        }

        await deleteUser({ user_id: req.userId });

        const cache = new Cache();
        await cache.invalidade('users_devices');

        return res.status(204).send();
    }
}

export default new UserController();
