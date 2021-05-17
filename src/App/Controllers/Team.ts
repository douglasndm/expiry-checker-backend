import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import ProductTeams from '../Models/ProductTeams';
import UserRoles from '../Models/UserRoles';
import { User } from '../Models/User';
import { Team } from '../Models/Team';

import { getAllUsersByTeam } from '../../Functions/Teams';

class TeamController {
    async index(req: Request, res: Response): Promise<Response> {
        try {
            const { team_id } = req.params;

            const teamRepository = getRepository(Team);
            const productTeamsRepository = getRepository(ProductTeams);

            const usersInTeam = await getAllUsersByTeam({ team_id });

            const isUserInTeam = usersInTeam.filter(
                user => user.id === req.userId,
            );

            if (isUserInTeam.length <= 0) {
                return res
                    .status(401)
                    .json({ error: 'You dont have permission to be here' });
            }

            const team = await teamRepository.findOne(team_id);

            const products = await productTeamsRepository
                .createQueryBuilder('product_teams')
                .select('product_teams.id')
                .where('product_teams.team_id = :id', { id: team_id })
                .leftJoinAndSelect('product_teams.product', 'product')
                .leftJoinAndSelect('product.batches', 'batches')
                .getMany();

            const productsWithoutId = products.map(p => p.product);

            return res.status(200).json({ team, products: productsWithoutId });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    async store(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Provider the team name' });
        }

        try {
            const { name } = req.body;

            const teamRepository = getRepository(Team);
            const userRepository = getRepository(User);
            const userRolesRepository = getRepository(UserRoles);

            const user = await userRepository.findOne({
                where: {
                    firebaseUid: req.userId,
                },
            });

            if (!user) {
                return res.status(401).json({ error: 'You need to sign in' });
            }

            // Check if user already has a team with the same name
            const userTeams = await userRolesRepository.find({
                where: {
                    user: { id: user.id },
                },
                relations: ['team'],
            });

            const existsName = userTeams.filter(ur => ur.team.name === name);

            if (existsName.length > 0) {
                return res
                    .status(400)
                    .json({ error: 'You already have a team with that name' });
            }

            const team = new Team();
            team.name = name;

            const savedTeam = await teamRepository.save(team);

            const userRole = new UserRoles();
            userRole.team = savedTeam;
            userRole.user = user;
            userRole.role = 'Manager';

            const savedRole = await userRolesRepository.save(userRole);

            return res.status(200).json({
                team: savedTeam,
                user_role: savedRole.role,
            });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    async update(req: Request, res: Response): Promise<Response> {
        const schemaParams = Yup.object().shape({
            id: Yup.string().required().uuid(),
        });

        const schema = Yup.object().shape({
            name: Yup.string().required(),
        });

        if (
            !(await schemaParams.isValid(req.params)) ||
            !(await schema.isValid(req.body))
        ) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        try {
            const { id } = req.params;
            const { name } = req.body;

            const userRolesRepository = getRepository(UserRoles);

            const userRoles = await userRolesRepository.findOne({
                where: {
                    user: { id: req.userId },
                    team: { id },
                },
            });

            // this check if person has access and it is a manager to update the team
            if (
                !userRoles ||
                userRoles.role.toLocaleLowerCase() !== 'manager'
            ) {
                return res
                    .status(401)
                    .json({ error: 'You dont have authorization to be here' });
            }

            const teamRepository = getRepository(Team);
            const team = await teamRepository.findOne(id);

            if (!team) {
                return res.status(400).json({ error: 'Team was not found' });
            }

            // Check if user already has a team with the same name
            const userTeams = await userRolesRepository.find({
                where: {
                    user: { id: req.userId },
                },
                relations: ['team'],
            });

            const existsName = userTeams.filter(ur => ur.team.name === name);

            if (existsName.length > 0) {
                return res
                    .status(400)
                    .json({ error: 'You already have a team with that name' });
            }

            team.name = name;

            const updatedTeam = await teamRepository.save(team);

            return res.json(updatedTeam);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
}

export default new TeamController();
