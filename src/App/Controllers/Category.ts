import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import { getAllUsersByTeam } from '../../Functions/Teams';
import { isUserManager } from '../../Functions/Users/UserRoles';

import { Category } from '../Models/Category';
import { Team } from '../Models/Team';
import UserRoles from '../Models/UserRoles';

class CategoryController {
    async index(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            team_id: Yup.string().required().uuid(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        try {
            const { team_id } = req.body;

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

            const categoryRepository = getRepository(Category);
            const alreadyExists = await categoryRepository
                .createQueryBuilder('category')
                .where('LOWER(category.name) = LOWER(:name)', { name })
                .andWhere('team_id = :team_id', { team_id })
                .getOne();

            if (alreadyExists) {
                return res
                    .status(400)
                    .json({ error: 'Category already exists on team' });
            }

            const teamRepository = getRepository(Team);
            const team = await teamRepository.findOne({
                where: {
                    id: team_id,
                },
            });

            if (!team) {
                return res.status(400).json({ error: 'Team was not found' });
            }

            const category = new Category();
            category.name = name;
            category.team = team;

            const savedCategory = await categoryRepository.save(category);

            return res.status(201).json(savedCategory);
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
