import { Request, Response } from 'express';
import { getRepository } from 'typeorm';

import AppError from '@errors/AppError';

import { recheck } from '@utils/Team/Subscription';

import UserRoles from '@models/UserRoles';

class UserTeams {
    async index(req: Request, res: Response): Promise<Response> {
        if (!req.userId) {
            throw new AppError({
                message: 'Provider the user id',
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const userRolesRepo = getRepository(UserRoles);

        const userRoles = await userRolesRepo
            .createQueryBuilder('userRoles')
            .leftJoinAndSelect('userRoles.team', 'team')
            .leftJoinAndSelect('userRoles.user', 'user')
            .where('user.firebaseUid = :user_id', { user_id: req.userId })
            .getMany();

        const teamsManager = userRoles.filter(
            role => role.role.toLowerCase() === 'manager',
        );

        const subscription = await recheck({
            team_id: teamsManager[0].team.id,
        });

        const teams = userRoles.map(team => {
            if (team.role.toLowerCase() === 'manager') {
                return {
                    ...team.team,
                    role: team.role,
                    subscription: subscription[0] || null,
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
