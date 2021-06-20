import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import AppError from '@errors/AppError';

import { checkIfTeamIsActive, deleteTeam } from '@utils/Team';
import { getAllUsersByTeam } from '@utils/Teams';

import ProductTeams from '@models/ProductTeams';
import UserRoles from '@models/UserRoles';
import User from '@models/User';
import { Team } from '@models/Team';

class TeamController {
    async index(req: Request, res: Response): Promise<Response> {
        const { team_id } = req.params;

        const teamRepository = getRepository(Team);
        const productTeamsRepository = getRepository(ProductTeams);

        const subscription = await checkIfTeamIsActive({ team_id });
        if (!subscription) {
            throw new AppError("Team doesn't have an active subscription", 401);
        }

        const usersInTeam = await getAllUsersByTeam({ team_id });

        const isUserInTeam = usersInTeam.filter(user => user.id === req.userId);

        if (isUserInTeam.length <= 0) {
            throw new AppError('You dont have permission to be here', 401);
        }

        const team = await teamRepository.findOne(team_id);

        const products = await productTeamsRepository
            .createQueryBuilder('product_teams')
            .select('product_teams.id')
            .where('product_teams.team_id = :id', { id: team_id })
            .leftJoinAndSelect('product_teams.product', 'product')
            .leftJoinAndSelect('product.batches', 'batches')
            .orderBy('batches.exp_date', 'ASC')
            .getMany();

        const productsWithoutId = products.map(p => p.product);

        return res.status(200).json({ team, products: productsWithoutId });
    }

    async store(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
        });

        try {
            await schema.validate(req.body);
        } catch (err) {
            throw new AppError(err.message, 400);
        }

        if (!req.userId) {
            throw new AppError('Provide the user id', 401);
        }

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
            throw new AppError('User was not found', 400);
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
            throw new AppError('You already have a team with that name', 400);
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
    }

    async update(req: Request, res: Response): Promise<Response> {
        const schemaParams = Yup.object().shape({
            team_id: Yup.string().required().uuid(),
        });

        const schema = Yup.object().shape({
            name: Yup.string().required(),
        });

        try {
            await schemaParams.validate(req.params);
            await schema.validate(req.body);
        } catch (err) {
            throw new AppError(err.message, 400);
        }

        if (!req.userId) {
            throw new AppError('Provide the user id', 401);
        }

        const { team_id } = req.params;
        const { name } = req.body;

        const userRolesRepository = getRepository(UserRoles);

        const userRoles = await userRolesRepository.findOne({
            where: {
                user: { firebaseUid: req.userId },
                team: { id: team_id },
            },
        });

        // this check if person has access and it is a manager to update the team
        if (!userRoles || userRoles.role.toLocaleLowerCase() !== 'manager') {
            throw new AppError("You don't have authorization to be here", 401);
        }

        const teamRepository = getRepository(Team);
        const team = await teamRepository.findOne(team_id);

        if (!team) {
            throw new AppError('Team was not found', 400);
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
            throw new AppError('You already have a team with that name', 400);
        }

        team.name = name;

        const updatedTeam = await teamRepository.save(team);

        return res.json(updatedTeam);
    }

    async delete(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            team_id: Yup.string()
                .required('Team ID is required')
                .uuid('Team ID is not valid'),
        });

        try {
            await schema.validate(req.params);
        } catch (err) {
            throw new AppError(err.message, 400);
        }

        if (!req.userId) {
            throw new AppError('Provide the user id', 401);
        }

        const { team_id } = req.params;

        await deleteTeam({ team_id, user_id: req.userId });

        return res.status(204).send();
    }
}

export default new TeamController();
