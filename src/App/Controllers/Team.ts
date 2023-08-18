import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import Cache from '@services/Cache';
import {
    getProductImageURL,
    getProductImageURLByFileName,
} from '@services/AWS';

import { createTeam } from '@utils/Team/Create';
import { getProductsFromTeam } from '@utils/Team/Products';
import { getUserByFirebaseId } from '@utils/User/Find';
import { getTeamById } from '@utils/Team/Find';
import { getTeamFromUser } from '@utils/User/Team';

import { checkIfTeamIsActive, deleteTeam } from '@functions/Team';
import { deleteAllProducts } from '@functions/Team/Products';

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
        const { removeCheckedBatches, sortByBatches, page } = req.query;

        const subscription = await checkIfTeamIsActive({ team_id });

        if (!subscription) {
            throw new AppError({
                message: "Team doesn't have an active subscription",
                statusCode: 401,
                internalErrorCode: 5,
            });
        }

        const user = await getUserByFirebaseId(req.userId || '');

        const pg = Number(page) <= 0 ? 0 : Number(page);

        const { products, per_page, total } = await getProductsFromTeam({
            team_id,
            user_id: user.id,
            page: page ? pg : undefined,
            removeCheckedBatches: true,
            sortByBatches: true,
        });

        const fixedCategories = products.map(p => {
            const categories = p.categories.map(c => c.category);

            return {
                ...p,
                brand: p.brand?.id,
                categories,
            };
        });

        const productsWithImages = fixedCategories.map(p => {
            if (p.image) {
                return {
                    ...p,
                    thumbnail: getProductImageURLByFileName({
                        fileName: p.image,
                        team_id,
                    }),
                };
            }

            return {
                ...p,
                thumbnail: p.code ? getProductImageURL(p.code) : null,
            };
        });

        return res
            .status(200)
            .json({ total, page: pg, per_page, products: productsWithImages });
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
            name: name.trim(),
            admin_id: req.userId,
        });

        return res.status(200).json(team);
    }

    async update(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
        });

        try {
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

        const teamRepository = getRepository(Team);

        const user = await getUserByFirebaseId(req.userId);
        const userRoles = await getTeamFromUser(user.id);

        if (!userRoles) {
            throw new AppError({
                message: "You don't have authorization to be here",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        if (userRoles.team.id !== team_id) {
            throw new AppError({
                message: "You don't have permission to update this team",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const updatedTeam = await teamRepository.save({
            ...userRoles.team,
            name: name.trim(),
        });

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
