import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import AppError from '@errors/AppError';

import { createCategory } from '@utils/Category';
import { checkIfTeamIsActive } from '@utils/Team';
import { getAllUsersFromTeam } from '@utils/Team/Users';
import { isUserManager } from '@utils/Users/UserRoles';

import { Category } from '@models/Category';

class CategoryController {
    async index(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            team_id: Yup.string().required().uuid(),
        });

        try {
            await schema.validate(req.params);
        } catch (err) {
            throw new AppError({
                message: err.message,
                statusCode: 400,
                internalErrorCode: 1,
            });
        }

        const { team_id } = req.params;

        const subscription = await checkIfTeamIsActive({ team_id });

        if (!subscription) {
            throw new AppError({
                message: "Team doesn't have an active subscription",
                statusCode: 402,
                internalErrorCode: 5,
            });
        }

        const usersInTeam = await getAllUsersFromTeam({ team_id });

        const isUserInTeam = usersInTeam.filter(user => user.id === req.userId);

        if (isUserInTeam.length <= 0) {
            throw new AppError({
                message: "You don't have authorization to be here",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const categoryRepository = getRepository(Category);
        const categories = await categoryRepository.find({
            where: {
                team: { id: team_id },
            },
        });

        return res.status(200).json(categories);
    }

    async create(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            team_id: Yup.string().required().uuid(),
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

        const { name, team_id } = req.body;

        // Check if user has access and it is a manager on team
        const isManager = await isUserManager({
            user_id: req.userId,
            team_id,
        });

        if (!isManager) {
            throw new AppError({
                message: "You don't have authorization to be here",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const savedCategory = await createCategory({
            name,
            team_id,
        });

        return res.status(201).json(savedCategory);
    }

    async update(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            id: Yup.string().required().uuid(),
        });

        const schemaBody = Yup.object().shape({
            name: Yup.string(),
        });

        try {
            await schema.validate(req.params);
            await schemaBody.validate(req.body);
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

        const { id } = req.params;
        const { name } = req.body;

        const categoryRepository = getRepository(Category);
        const category = await categoryRepository.findOne(id, {
            relations: ['team'],
        });

        if (!category) {
            throw new AppError({
                message: 'Category was not found',
                statusCode: 400,
                internalErrorCode: 10,
            });
        }
        // Check if user has access and it is a manager on team
        const isManager = await isUserManager({
            user_id: req.userId,
            team_id: category.team.id,
        });

        if (!isManager) {
            throw new AppError({
                message: "You don't have authorization to be here",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        category.name = name;

        const updatedCategory = await categoryRepository.save(category);
        return res.status(200).json(updatedCategory);
    }

    async delete(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            id: Yup.string().required().uuid(),
        });

        try {
            await schema.validate(req.params);
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

        const { id } = req.params;

        const categoryRepository = getRepository(Category);
        const category = await categoryRepository.findOne(id, {
            relations: ['team'],
        });

        if (!category) {
            throw new AppError({
                message: 'Category was not found',
                statusCode: 400,
                internalErrorCode: 10,
            });
        }
        // Check if user has access and it is a manager on team
        const isManager = await isUserManager({
            user_id: req.userId,
            team_id: category.team.id,
        });

        if (!isManager) {
            throw new AppError({
                message: "You don't have authorization to do that",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        await categoryRepository.remove(category);

        return res.status(204).send();
    }
}

export default new CategoryController();
