import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';
import { createCategory } from '../../Functions/Category';

import { getAllUsersByTeam } from '../../Functions/Teams';
import { isUserManager } from '../../Functions/Users/UserRoles';

import { Category } from '../Models/Category';

class CategoryController {
    async index(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            team_id: Yup.string().required().uuid(),
        });

        if (!(await schema.isValid(req.params))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        try {
            const { team_id } = req.params;

            const usersInTeam = await getAllUsersByTeam({ team_id });

            const isUserInTeam = usersInTeam.filter(
                user => user.id === req.userId,
            );

            if (isUserInTeam.length <= 0) {
                return res
                    .status(401)
                    .json({ error: 'You dont have permission to be here' });
            }

            const categoryRepository = getRepository(Category);
            const categories = await categoryRepository.find({
                where: {
                    team: { id: team_id },
                },
            });

            return res.status(200).json(categories);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    async create(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            team_id: Yup.string().required().uuid(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        try {
            const { name, team_id } = req.body;

            // Check if user has access and it is a manager on team
            const isManager = await isUserManager({
                user_id: req.userId,
                team_id,
            });

            if (!isManager) {
                return res.status(401).json({
                    error: "You don't have authorization to do that.",
                });
            }

            const savedCategory = await createCategory({
                name,
                team_id,
            });

            return res.status(201).json(savedCategory);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    async update(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            id: Yup.string().required().uuid(),
        });

        const schemaBody = Yup.object().shape({
            name: Yup.string(),
        });

        if (
            !(await schema.isValid(req.params)) ||
            !(await schemaBody.isValid(req.body))
        ) {
            return res.status(400).json({ error: 'Validation fails' });
        }
        try {
            const { id } = req.params;
            const { name } = req.body;

            const categoryRepository = getRepository(Category);
            const category = await categoryRepository.findOne(id, {
                relations: ['team'],
            });

            if (!category) {
                return res
                    .status(400)
                    .json({ error: 'Category was not found' });
            }
            // Check if user has access and it is a manager on team
            const isManager = await isUserManager({
                user_id: req.userId,
                team_id: category.team.id,
            });

            if (!isManager) {
                return res.status(401).json({
                    error: "You don't have authorization to do that.",
                });
            }

            category.name = name;

            const updatedCategory = await categoryRepository.save(category);
            return res.status(200).json(updatedCategory);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    async delete(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            id: Yup.string().required().uuid(),
        });

        if (!(await schema.isValid(req.params))) {
            return res.status(400).json({ error: 'Validation fails' });
        }
        try {
            const { id } = req.params;

            const categoryRepository = getRepository(Category);
            const category = await categoryRepository.findOne(id, {
                relations: ['team'],
            });

            if (!category) {
                return res
                    .status(400)
                    .json({ error: 'Category was not found' });
            }
            // Check if user has access and it is a manager on team
            const isManager = await isUserManager({
                user_id: req.userId,
                team_id: category.team.id,
            });

            if (!isManager) {
                return res.status(401).json({
                    error: "You don't have authorization to do that.",
                });
            }

            await categoryRepository.remove(category);

            return res.status(200).json({ success: 'Category was removed' });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
}

export default new CategoryController();
