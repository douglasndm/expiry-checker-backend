import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import UserRoles from '../Models/UserRoles';
import { Team } from '../Models/Team';
import User from '../Models/User';

import { checkMembersLimit } from '../../Functions/Team';

class UserManagerController {
    async create(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            team_id: Yup.string().required().uuid(),
        });

        const schemaBody = Yup.object().shape({
            email: Yup.string().required().email(),
        });

        if (
            !(await schema.isValid(req.params)) ||
            !(await schemaBody.isValid(req.body))
        ) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        try {
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
                return res
                    .status(400)
                    .json({ error: 'User is already into team' });
            }

            const teamRepository = getRepository(Team);
            const userRepository = getRepository(User);

            const team = await teamRepository.findOne(team_id);
            const user = await userRepository
                .createQueryBuilder('user')
                .where('LOWER(user.email) = LOWER(:email)', { email })
                .getOne();

            if (!team || !user) {
                return res
                    .status(400)
                    .json({ error: 'User or team was not found' });
            }

            const membersChecker = await checkMembersLimit({
                team_id,
            });

            if (membersChecker.members >= membersChecker.limit) {
                return res
                    .status(401)
                    .json({ error: 'Team has reach the limit of members' });
            }

            const teamUser = new UserRoles();
            teamUser.user = user;
            teamUser.team = team;
            teamUser.role = 'Repositor';
            teamUser.code = Math.random().toString(36).substring(7);
            teamUser.status = 'Pending';

            const savedRole = await userRolesRepository.save(teamUser);

            return res.json(savedRole);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    async update(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            team_id: Yup.string().required().uuid(),
        });

        const schemaBody = Yup.object().shape({
            user_id: Yup.string().required(),
            role: Yup.string(),
            name: Yup.string(),
            lastName: Yup.string(),
            email: Yup.string().email(),
        });

        if (
            !(await schema.isValid(req.params)) ||
            !(await schemaBody.isValid(req.body))
        ) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        try {
            const { team_id } = req.params;
            const { user_id, role, name, lastName, email } = req.body;

            if (role.toLowerCase() !== 'manager') {
                if (role.toLowerCase() !== 'supervisor') {
                    if (role.toLowerCase() !== 'repositor') {
                        return res
                            .status(400)
                            .json({ error: 'Role setted is invalid' });
                    }
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
                return res
                    .status(401)
                    .json({ error: 'You dont have authorization to do that' });
            }

            const userRole = await userRolesRepository.findOne({
                where: {
                    user: { firebaseUid: user_id },
                    team: { id: team_id },
                },
                relations: ['user'],
            });

            if (!userRole) {
                return res
                    .status(400)
                    .json({ error: 'User in team was not found' });
            }

            userRole.role = role.toLowerCase();

            const updateRole = await userRolesRepository.save(userRole);

            /*
                In the future perhaps managers will be able to change users info
                like name, lastname and email
            */

            return res.json(updateRole);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    async delete(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            team_id: Yup.string().required().uuid(),
            user_id: Yup.string().required(),
        });

        if (!(await schema.isValid(req.params))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        try {
            const { team_id, user_id } = req.params;

            if (req.userId === user_id) {
                return res
                    .status(400)
                    .json({ error: "You can't remove yourself from a team" });
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
                return res.status(400).json({ error: 'User is not in team' });
            }

            await repository.remove(role);

            return res.status(200).json({ success: true });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
}

export default new UserManagerController();
