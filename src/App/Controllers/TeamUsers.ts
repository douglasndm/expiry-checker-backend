import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import { getAllUsersByTeam } from '../../Functions/Teams';

import UserRoles from '../Models/UserRoles';

class TeamUsersController {
    async index(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            id: Yup.string().required().uuid(),
        });

        if (!(await schema.isValid(req.params))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        try {
            const { id } = req.params;

            const usersInTeam = await getAllUsersByTeam({ team_id: id });

            const isUserInTeam = usersInTeam.find(
                user => user.id === req.userId,
            );

            if (!isUserInTeam) {
                return res
                    .status(401)
                    .json({ error: 'You dont have permission to be here' });
            }

            if (isUserInTeam.role.toLowerCase() !== 'manager') {
                delete isUserInTeam.code;
            }

            return res.status(200).json(usersInTeam);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
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
