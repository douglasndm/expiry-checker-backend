import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import Cache from '@services/Cache';

import UserRoles from '@models/UserRoles';
import Team from '@models/Team';
import User from '@models/User';

import { removeUser, updateRole } from '@utils/Team/Roles/User';

import { checkMembersLimit } from '@functions/Team';

import AppError from '@errors/AppError';

class UserManagerController {
    async create(req: Request, res: Response): Promise<Response> {
        const schemaBody = Yup.object().shape({
            email: Yup.string().required().email(),
        });

        try {
            await schemaBody.validate(req.body);
        } catch (err) {
            if (err instanceof Error)
                throw new AppError({ message: err.message });
        }

        const { team_id } = req.params;
        const { email } = req.body;

        const userRolesRepository = getRepository(UserRoles);

        const cache = new Cache();
        const cachedUsers = await cache.get<Array<UserRoles>>(
            `users-from-teams:${team_id}`,
        );

        // Check if user is already on team
        // #region
        if (cachedUsers) {
            const alreadyInTeam = cachedUsers.find(
                u => u.user.email.toLowerCase() === String(email).toLowerCase(),
            );

            if (alreadyInTeam) {
                throw new AppError({
                    message: 'User is already into team',
                    statusCode: 400,
                    internalErrorCode: 23,
                });
            }
        } else {
            const alreadyInARole = await userRolesRepository
                .createQueryBuilder('userRole')
                .leftJoinAndSelect('userRole.user', 'user')
                .where('userRole.team.id = :team_id', { team_id })
                .andWhere('LOWER(user.email) = LOWER(:email)', { email })
                .getOne();

            if (alreadyInARole) {
                throw new AppError({
                    message: 'User is already into team',
                    statusCode: 400,
                    internalErrorCode: 23,
                });
            }
        }
        // #endregion

        const teamRepository = getRepository(Team);
        const userRepository = getRepository(User);

        const team = await teamRepository.findOne(team_id);
        const user = await userRepository
            .createQueryBuilder('user')
            .where('LOWER(user.email) = LOWER(:email)', { email })
            .getOne();

        if (!team || !user) {
            throw new AppError({
                message: 'User or team was not found',
                statusCode: 400,
                internalErrorCode: 18,
            });
        }

        const membersChecker = await checkMembersLimit({
            team_id,
        });

        if (membersChecker.members >= membersChecker.limit) {
            throw new AppError({
                message: 'Team has reach the limit of members',
                statusCode: 401,
                internalErrorCode: 16,
            });
        }

        const teamUser = new UserRoles();
        teamUser.user = user;
        teamUser.team = team;
        teamUser.role = 'Repositor';
        teamUser.code = Math.random().toString(36).substring(7);
        teamUser.status = 'Pending';

        const savedRole = await userRolesRepository.save(teamUser);
        await cache.invalidade(`users-from-teams:${team_id}`);

        return res.json(savedRole);
    }

    async update(req: Request, res: Response): Promise<Response> {
        const schemaBody = Yup.object().shape({
            user_id: Yup.string().required(),
            role: Yup.string(),
        });

        try {
            await schemaBody.validate(req.body);
        } catch (err) {
            if (err instanceof Error)
                throw new AppError({
                    message: err.message,
                    internalErrorCode: 1,
                });
        }

        const { team_id } = req.params;
        const { user_id, role } = req.body;

        if (role.toLowerCase() === 'manager') {
            throw new AppError({
                message: "You can't put another manager on team",
                statusCode: 400,
                internalErrorCode: 20,
            });
        }

        const updatedRole = await updateRole({
            role,
            team_id,
            user_id,
        });

        return res.json(updatedRole);
    }

    async delete(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            user_id: Yup.string().uuid().required('Provide the user id'),
        });

        try {
            await schema.validate(req.params);
        } catch (err) {
            if (err instanceof Error) {
                throw new AppError({ message: err.message });
            }
        }

        const { team_id, user_id } = req.params;

        if (req.userId === user_id) {
            throw new AppError({
                message: "You can't remove yourself from a team",
                statusCode: 401,
            });
        }

        await removeUser({ user_id, team_id });

        return res.status(204).send();
    }
}

export default new UserManagerController();
