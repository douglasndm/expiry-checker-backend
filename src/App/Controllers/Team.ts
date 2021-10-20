import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import AppError from '@errors/AppError';

import { checkIfTeamIsActive, deleteTeam } from '@functions/Team';
import { deleteAllProducts } from '@functions/Team/Products';
import { getAllUsersFromTeam } from '@functions/Team/Users';
import { sortProductsByBatchesExpDate } from '@functions/Products';

import ProductTeams from '@models/ProductTeams';
import UserRoles from '@models/UserRoles';
import User from '@models/User';
import Team from '@models/Team';

import Cache from '@services/Cache';

class TeamController {
    async index(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            team_id: Yup.string().required().uuid(),
        });

        const schemaQuerys = Yup.object().shape({
            removeCheckedBatches: Yup.string(),
            sortByBatches: Yup.string(),
        });

        try {
            await schema.validate(req.params);
            await schemaQuerys.validate(req.query);
        } catch (err) {
            if (err instanceof Error)
                throw new AppError({
                    message: err.message,
                    statusCode: 400,
                    internalErrorCode: 1,
                });
        }

        const cache = new Cache();

        const { team_id } = req.params;
        const { removeCheckedBatches, sortByBatches } = req.query;

        const teamRepository = getRepository(Team);
        const productTeamsRepository = getRepository(ProductTeams);

        const subscription = await checkIfTeamIsActive({ team_id });

        if (!subscription) {
            throw new AppError({
                message: "Team doesn't have an active subscription",
                statusCode: 401,
                internalErrorCode: 5,
            });
        }

        const usersInTeam = await getAllUsersFromTeam({ team_id });

        const isUserInTeam = usersInTeam.filter(user => user.id === req.userId);

        if (isUserInTeam.length <= 0) {
            throw new AppError({
                message: 'You dont have permission to be here',
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const cachedProds = await cache.get<Array<ProductTeams>>(
            `products-from-teams:${team_id}`,
        );

        if (!cachedProds) {
            const team = await teamRepository.findOne(team_id);

            const prodTeam = await productTeamsRepository
                .createQueryBuilder('product_teams')
                .select('product_teams.id')
                .where('product_teams.team_id = :id', { id: team_id })
                .leftJoinAndSelect('product_teams.product', 'product')

                .leftJoinAndSelect('product.brand', 'brand')
                .leftJoinAndSelect('product.categories', 'prodCat')
                .leftJoinAndSelect('prodCat.category', 'category')
                .leftJoinAndSelect('product.batches', 'batches')
                .orderBy('batches.exp_date', 'ASC')
                .getMany();

            let products = prodTeam.map(p => p.product);

            if (removeCheckedBatches) {
                const checkedRemoved = products.map(prod => {
                    const batches = prod.batches.filter(
                        batch => batch.status !== 'checked',
                    );

                    return {
                        ...prod,
                        batches,
                    };
                });

                products = checkedRemoved;
            }

            if (sortByBatches) {
                products = sortProductsByBatchesExpDate(products);
            }

            const fixedCategories = products.map(p => {
                const categories = p.categories.map(c => c.category);

                return {
                    ...p,
                    brand: p.brand?.id,
                    categories,
                };
            });

            await cache.save(`products-from-teams:${team_id}`, {
                team,
                products: fixedCategories,
            });

            return res.status(200).json({ team, products });
        }

        return res.status(200).json(cachedProds);
    }

    async store(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
        });

        try {
            await schema.validate(req.body);
        } catch (err) {
            throw new AppError({
                message: err.message,
                statusCode: 400,
                internalErrorCode: 1,
            });
        }

        if (!req.userId) {
            throw new AppError({
                message: 'Provide the user id',
                statusCode: 401,
                internalErrorCode: 2,
            });
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
            throw new AppError({
                message: 'User was not found',
                statusCode: 400,
                internalErrorCode: 7,
            });
        }

        // Check if user already has a team with the same name
        const userTeams = await userRolesRepository
            .createQueryBuilder('userTeams')
            .leftJoinAndSelect('userTeams.team', 'team')
            .leftJoinAndSelect('userTeams.user', 'user')
            .where('user.firebaseUid = :user_id', { user_id: req.userId })
            .getMany();

        const alreadyManager = userTeams.filter(
            ur => ur.role.toLowerCase() === 'manager',
        );

        if (alreadyManager.length > 0) {
            throw new AppError({
                message: 'You are already a manager from another team',
                statusCode: 400,
            });
        }

        const existsName = userTeams.filter(
            ur => ur.team.name.toLowerCase() === String(name).toLowerCase(),
        );

        if (existsName.length > 0) {
            throw new AppError({
                message: 'You already have a team with that name',
                statusCode: 400,
                internalErrorCode: 14,
            });
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
            throw new AppError({ message: err.message, internalErrorCode: 1 });
        }

        if (!req.userId) {
            throw new AppError({
                message: 'Provide the user id',
                statusCode: 401,
                internalErrorCode: 2,
            });
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
            throw new AppError({
                message: "You don't have authorization to be here",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const teamRepository = getRepository(Team);
        const team = await teamRepository.findOne(team_id);

        if (!team) {
            throw new AppError({
                message: 'Team was not found',
                statusCode: 400,
                internalErrorCode: 6,
            });
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
            throw new AppError({
                message: 'You already have a team with that name',
            });
        }

        team.name = name;

        const updatedTeam = await teamRepository.save(team);

        return res.json(updatedTeam);
    }

    async delete(req: Request, res: Response): Promise<Response> {
        if (!req.userId) {
            throw new AppError({
                message: 'Provide the user id',
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const { team_id } = req.params;

        const cache = new Cache();

        await deleteAllProducts({ team_id });
        await deleteTeam({ team_id, user_id: req.userId });

        await cache.invalidade(`products-from-teams:${team_id}`);
        await cache.invalidade(`users-from-teams:${team_id}`);

        return res.status(204).send();
    }
}

export default new TeamController();
