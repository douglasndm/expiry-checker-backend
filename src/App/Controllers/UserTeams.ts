import { Request, Response } from 'express';

import { defaultDataSource } from '@services/TypeORM';

import UserTeam from '@models/UserTeam';
import TeamSubscription from '@models/TeamSubscription';

import { getSubscription } from '@utils/Subscriptions/Subscription';

import AppError from '@errors/AppError';

class UserTeams {
    async index(req: Request, res: Response): Promise<Response> {
        if (!req.userId) {
            throw new AppError({
                message: 'Provider the user id',
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const userRolesRepo = defaultDataSource.getRepository(UserTeam);

        const userRoles = await userRolesRepo
            .createQueryBuilder('userRoles')
            .leftJoinAndSelect('userRoles.team', 'team')
            .leftJoinAndSelect('userRoles.user', 'user')
            .where('user.firebaseUid = :user_id', { user_id: req.userId })
            .getMany();

        const teamsManager = userRoles.filter(
            role => role.role.toLowerCase() === 'manager',
        );

        let subscription: TeamSubscription | null = null;

        if (teamsManager.length > 0) {
            const team_id = teamsManager[0].team.id;

            try {
                const sub = await getSubscription(team_id);

                subscription = sub;
            } catch (err) {
                subscription = null;
            }
        }

        const teams = userRoles.map(team => {
            if (team.role.toLowerCase() === 'manager') {
                const sub = subscription;
                return {
                    ...team.team,
                    role: team.role.toLowerCase(),
                    subscription: sub || null,
                };
            }

            return {
                ...team.team,
                role: team.role,
            };
        });

        return res.status(200).json(teams);
    }
}

export default new UserTeams();
