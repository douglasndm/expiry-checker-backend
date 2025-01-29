import { Request, Response } from 'express';
import * as Yup from 'yup';

import { defaultDataSource } from '@services/TypeORM';

import {
    getProductImageURL,
    getTeamProductImageURLByFileName,
} from '@services/AWS';
import { deleteTeamFromS3 } from '@services/AWS/Team';
import { invalidadeTeamCache } from '@services/Cache/Redis';

import { createTeam } from '@utils/Team/Create';
import { getProductsFromTeam } from '@utils/Team/Products';
import { getUserByFirebaseId } from '@utils/User/Find';
import { getTeamFromUser } from '@utils/User/Team';
import { deleteTeam } from '@utils/Team/Delete';

import Team from '@models/Team';

import AppError from '@errors/AppError';

class TeamController {
    async index(req: Request, res: Response): Promise<Response> {
        const schemaQuerys = Yup.object().shape({
            removeCheckedBatches: Yup.string(),
            sortByBatches: Yup.string(),
            page: Yup.number(),
            per_page: Yup.number(),
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
        const { removeCheckedBatches, sortByBatches, page, per_page } =
            req.query;

        const user = await getUserByFirebaseId(req.userId || '');

        let pg = 0;

        if (page) {
            pg = Number(page) <= 0 ? 0 : Number(page) - 1;
        }

        const { products, total } = await getProductsFromTeam({
            team_id,
            user_id: user.id,
            page: pg,
            per_page: per_page ? Number(per_page) : undefined,
            removeCheckedBatches: removeCheckedBatches === 'true',
            sortByBatches: sortByBatches === 'true',
        });

        const productsWithImages = products.map(p => {
            if (p.image) {
                return {
                    ...p,
                    thumbnail: getTeamProductImageURLByFileName({
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

        const teamRepository = defaultDataSource.getRepository(Team);

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

        await deleteTeam(team_id);

        await invalidadeTeamCache(team_id);

        await deleteTeamFromS3(team_id);

        return res.status(204).send();
    }
}

export default new TeamController();
