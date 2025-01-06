import { Request, Response } from 'express';
import * as Yup from 'yup';

import { defaultDataSource } from '@services/TypeORM';

import { invalidadeCache } from '@services/Cache/Redis';

import User from '@models/User';
import UserTeam from '@models/UserTeam';
import Store from '@models/Store';

import { getUserByFirebaseId, getUserById } from '@utils/User/Find';
import { createUser } from '@utils/User/Create';
import { updateUser } from '@utils/User/Update';
import { getTeamFromUser } from '@utils/User/Team';
import { getUserRole } from '@utils/Team/Roles/Find';
import { getSubscriptionFromTeam } from '@utils/Team/Subscription/Get';

import { deleteUser } from '@functions/Users';

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

        const repository = defaultDataSource.getRepository(User);

        const user = await repository
            .createQueryBuilder('user')
            .where('user.firebaseUid = :id', { id: req.userId })
            .leftJoinAndSelect('user.role', 'role')
            .leftJoinAndSelect('user.store', 'userStore')
            .leftJoinAndSelect('userStore.store', 'store')
            .leftJoinAndSelect('user.login', 'login')
            .leftJoinAndSelect('role.team', 'team')
            .leftJoinAndSelect('team.subscriptions', 'subscriptions')
            .select([
                'user',
                'role.role',
                'role.code',
                'role.status',

                'userStore',
                'store.id',
                'store.name',

                'team.id',
                'team.name',

                'subscriptions.expireIn',
                'subscriptions.membersLimit',
            ])
            .getOne();

        if (!user) {
            throw new AppError({
                message: 'User not found',
                statusCode: 401,
                internalErrorCode: 7,
            });
        }

        let organizedUser = {
            id: user.id,
            fid: user.firebaseUid,
            email: user.email,
            name: user.name,
            last_name: user.lastName,
            role: user.role,
        };

        const { subscriptions } = user.role.team;

        if (user.role) {
            organizedUser = {
                ...organizedUser,
                role: {
                    ...user.role,
                    team: {
                        ...user.role.team,
                        subscriptions:
                            subscriptions && subscriptions.length > 0
                                ? [
                                      {
                                          ...subscriptions[0],
                                          isActive: true,
                                      },
                                  ]
                                : [],
                    },
                },
                store:
                    user.store && user.role.role.toLowerCase() !== 'manager'
                        ? user.store.store
                        : null,
            };
        }

        return res.status(200).json(organizedUser);

        /*
        if (!req.userUUID) {
            throw new AppError({
                message: 'Provide the user id',
                statusCode: 401,
                internalErrorCode: 1,
            });
        }
        const user = await getUserById(req.userUUID);
        const userTeam = await getTeamFromUser(user.id);
        let role: UserTeam | null = null;

        if (userTeam) {
            role = await getUserRole({
                user_id: user.id,
                team_id: userTeam.team.id,
            });
        }
        interface IResponseSubscription {
            expireIn: string | Date;
            membersLimit: number;
        }
        interface IResponse {
            id: string;
            fid: string;
            email: string;
            name?: string | null;
            last_name?: string | null;
            role?: {
                role: string;
                code: string | null;
                status: string | null;
                team: {
                    id: string;
                    name: string;
                    subscriptions: IResponseSubscription[];
                };
            };
            store?: Store | null;
        }

        let response: IResponse = {
            id: user.id,
            fid: user.firebaseUid,
            email: user.email,
            name: user.name,
            last_name: user.lastName,
        };

        if (role && userTeam) {
            const teamSubscription = await getSubscriptionFromTeam(
                role.team.id,
            );

            const subscriptions: IResponseSubscription[] = [];

            if (teamSubscription) {
                subscriptions.push(teamSubscription);
            }

            let store: Store | null = null;

            if (user.role && user.role.role.toLowerCase() !== 'manager') {
                store = user.store ? user.store.store : null;
            }

            response = {
                ...response,
                role: {
                    role: role.role,
                    code: role.code,
                    status: role.status,
                    team: {
                        id: role.team.id,
                        name: userTeam.team.name || '',
                        isActive: true,
                        subscriptions:
                            subscriptions.length > 0
                                ? [
                                      {
                                          ...subscriptions[0],
                                          isActive: true,
                                      },
                                  ]
                                : [],
                    },
                },
                store,
            };
        }

        return res.status(200).json(response);
        */
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

        const repository = defaultDataSource.getRepository(User);
        const existsUser = await repository.findOne({ where: { email } });

        if (existsUser) {
            throw new AppError({
                message: 'User already exists',
                internalErrorCode: 40,
            });
        }

        const savedUser = await createUser({
            firebaseUid,
            email,
            name,
            lastName,
            password,
        });

        await invalidadeCache('users_devices');

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

        await invalidadeCache('users_devices');

        return res.status(204).send();
    }
}

export default new UserController();
