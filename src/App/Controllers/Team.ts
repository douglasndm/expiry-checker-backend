import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import Cache from '@services/Cache';

import { createTeam } from '@utils/Team';
import { getProductsFromTeam } from '@utils/Team/Products';
import { getUserByFirebaseId } from '@utils/User/Find';

import { checkIfTeamIsActive, deleteTeam } from '@functions/Team';
import { deleteAllProducts } from '@functions/Team/Products';
import { getAllUsersFromTeam } from '@functions/Team/Users';
import { sortProductsByBatchesExpDate } from '@functions/Products';

import UserRoles from '@models/UserRoles';
import Team from '@models/Team';

import AppError from '@errors/AppError';

class TeamController {
    async index(req: Request, res: Response): Promise<Response> {
        const schemaQuerys = Yup.object().shape({
            removeCheckedBatches: Yup.string(),
            sortByBatches: Yup.string(),
        });

        try {
            await schemaQuerys.validate(req.query);
        } catch (err) {
            if (err instanceof Error)
                throw new AppError({
                    message: err.message,
                    statusCode: 400,
                    internalErrorCode: 1,
                });
        }
        const { team_id } = req.params;
        const { removeCheckedBatches, sortByBatches } = req.query;

        const teamRepository = getRepository(Team);

        const subscription = await checkIfTeamIsActive({ team_id });

        if (!subscription) {
            throw new AppError({
                message: "Team doesn't have an active subscription",
                statusCode: 401,
                internalErrorCode: 5,
            });
        }

        const usersInTeam = await getAllUsersFromTeam({ team_id });

        const isUserInTeam = usersInTeam.filter(
            user => user.fid === req.userId,
        );

        if (isUserInTeam.length <= 0) {
            throw new AppError({
                message: 'You dont have permission to be here',
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const team = await teamRepository.findOne(team_id);

        const user = await getUserByFirebaseId(req.userId || '');

        let products = await getProductsFromTeam({
            team_id,
            user_id: user.id,
        });

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

        return res.status(200).json({ team, products: fixedCategories });
    }

    async store(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
        });

        try {
            await schema.validate(req.body);
        } catch (err) {
            if (err instanceof Error)
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

        const team = await createTeam({
            name,
            admin_id: req.userId,
        });

        return res.status(200).json(team);
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
            if (err instanceof Error)
                throw new AppError({
                    message: err.message,
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
