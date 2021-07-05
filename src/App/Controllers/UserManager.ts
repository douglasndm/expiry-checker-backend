import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import AppError from '@errors/AppError';

import UserRoles from '@models/UserRoles';
import Team from '@models/Team';
import User from '@models/User';

import { checkMembersLimit } from '@utils/Team';

class UserManagerController {
    async create(req: Request, res: Response): Promise<Response> {
        const schemaBody = Yup.object().shape({
            email: Yup.string().required().email(),
        });

        try {
            await schemaBody.validate(req.body);
        } catch (err) {
            throw new AppError({ message: err.message });
        }

        const { team_id } = req.params;
        const { email } = req.body;

        const userRolesRepository = getRepository(UserRoles);

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
            });
        }

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
            throw new AppError({ message: err.message, internalErrorCode: 1 });
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

        if (role.toLowerCase() !== 'supervisor') {
            if (role.toLowerCase() !== 'repositor') {
                throw new AppError({
                    message: 'Role is invalid',
                    internalErrorCode: 21,
                });
            }
        }

        const userRolesRepository = getRepository(UserRoles);

        const userRoles = await userRolesRepository.findOne({
            where: {
                user: { firebaseUid: req.userId },
                team: { id: team_id },
            },
        });

        if (userRoles?.role.toLowerCase() !== 'manager') {
            throw new AppError({
                message: 'You dont have authorization to do that',
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const userRole = await userRolesRepository.findOne({
            where: {
                user: { firebaseUid: user_id },
                team: { id: team_id },
            },
            relations: ['user'],
        });

        if (!userRole) {
            throw new AppError({
                message: 'User in team was not found',
                statusCode: 400,
                internalErrorCode: 17,
            });
        }

        userRole.role = role.toLowerCase();

        const updateRole = await userRolesRepository.save(userRole);

        return res.json(updateRole);
    }

    async delete(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            user_id: Yup.string().required('Provide the user id'),
        });

        try {
            await schema.validate(req.params);
        } catch (err) {
            throw new AppError({ message: err.message });
        }

        const { team_id, user_id } = req.params;

        if (req.userId === user_id) {
            throw new AppError({
                message: "You can't remove yourself from a team",
                statusCode: 401,
            });
        }

        const repository = getRepository(UserRoles);

        const role = await repository
            .createQueryBuilder('role')
            .leftJoinAndSelect('role.user', 'user')
            .leftJoinAndSelect('role.team', 'team')
            .where('user.firebaseUid = :user_id', { user_id })
            .andWhere('team.id = :team_id', { team_id })
            .getOne();

        if (!role) {
            throw new AppError({
                message: 'User is not in team',
                statusCode: 400,
                internalErrorCode: 17,
            });
        }

        await repository.remove(role);

        return res.status(204).send();
    }
}

export default new UserManagerController();
