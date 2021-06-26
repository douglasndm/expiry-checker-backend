import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import AppError from '@errors/AppError';

import { getAllUsersFromTeam, UserResponse } from '@utils/Team/Users';

import UserRoles from '@models/UserRoles';

class TeamUsersController {
    async index(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            team_id: Yup.string().required().uuid(),
        });

        try {
            await schema.validate(req.params);
        } catch (err) {
            throw new AppError({ message: err.message });
        }

        const { team_id } = req.params;

        const usersInTeam = await getAllUsersFromTeam({ team_id });

        const isUserInTeam = usersInTeam.find(user => user.id === req.userId);

        if (!isUserInTeam) {
            throw new AppError({
                message: "You don't have permission to be here",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const usersResponse: Array<UserResponse> = [];

        if (isUserInTeam.role.toLowerCase() !== 'manager') {
            usersInTeam.forEach(user => {
                usersResponse.push({
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                });
            });

            return res.status(200).json(usersResponse);
        }
        return res.status(200).json(usersInTeam);
    }

    async store(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            team_id: Yup.string().required().uuid(),
        });

        const schemaBody = Yup.object().shape({
            code: Yup.string().required(),
        });

        if (
            !(await schema.isValid(req.params)) ||
            !(await schemaBody.isValid(req.body))
        ) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        try {
            const { team_id } = req.params;
            const { code } = req.body;

            const userRolesRepositoy = getRepository(UserRoles);
            const roles = await userRolesRepositoy
                .createQueryBuilder('userRoles')
                .leftJoinAndSelect('userRoles.team', 'team')
                .leftJoinAndSelect('userRoles.user', 'user')
                .where('team.id = :team_id', { team_id })
                .andWhere('user.firebaseUid = :user_id', {
                    user_id: req.userId,
                })
                .getOne();

            if (!roles) {
                return res
                    .status(401)
                    .json({ error: 'You was not invited to the team' });
            }

            if (code !== roles.code) {
                return res.status(403).json({ error: 'Code is not valid' });
            }

            roles.status = 'Completed';

            const updatedRole = await userRolesRepositoy.save(roles);

            return res.status(200).json(updatedRole);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
}

export default new TeamUsersController();
