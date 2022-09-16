import { Request, Response } from 'express';
import * as Yup from 'yup';

import { getAllCategoriesFromTeam } from '@utils/Categories/List';
import { createCategory } from '@utils/Categories/Create';
import { updateCategory } from '@utils/Categories/Update';
import { deleteCategory } from '@utils/Categories/Delete';
import { sortCategories } from '@utils/Categories/Sort';

import { checkIfTeamIsActive } from '@functions/Team';

import AppError from '@errors/AppError';

class CategoryController {
    async index(req: Request, res: Response): Promise<Response> {
        const { team_id } = req.params;

        const subscription = await checkIfTeamIsActive({ team_id });

        if (!subscription) {
            throw new AppError({
                message: "Team doesn't have an active subscription",
                statusCode: 402,
                internalErrorCode: 5,
            });
        }

        const categories = await getAllCategoriesFromTeam({ team_id });

        return res.status(200).json(sortCategories(categories));
    }

    async create(req: Request, res: Response): Promise<Response> {
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
        const { name } = req.body;
        let { team_id } = req.body; // shoulb be removed soon

        if (!team_id) {
            team_id = req.params.team_id;
        }

        const savedCategory = await createCategory({
            name,
            team_id,
        });

        return res.status(201).json(savedCategory);
    }

    async update(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            category_id: Yup.string().required().uuid(),
        });

        const schemaBody = Yup.object().shape({
            name: Yup.string(),
        });

        try {
            await schema.validate(req.params);
            await schemaBody.validate(req.body);
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

        const { category_id } = req.params;
        const { name } = req.body;

        const updatedCategory = await updateCategory({ category_id, name });

        return res.status(200).json(updatedCategory);
    }

    async delete(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            category_id: Yup.string().required().uuid(),
        });

        try {
            await schema.validate(req.params);
        } catch (err) {
            if (err instanceof Error)
                throw new AppError({
                    message: err.message,
                    statusCode: 400,
                    internalErrorCode: 1,
                });
        }

        const { category_id } = req.params;

        await deleteCategory({ category_id });

        return res.status(204).send();
    }
}

export default new CategoryController();
