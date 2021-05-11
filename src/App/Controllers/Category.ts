import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import { getAllUsersByTeam } from '../../Functions/Teams';

import { Category } from '../Models/Category';

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
}

export default new CategoryController();
