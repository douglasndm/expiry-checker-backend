import { Request, Response } from 'express';
import * as Yup from 'yup';

import { createAndAddUserOnTeam } from '@utils/Team/Management/Users/CreateAndAdd';

import AppError from '@errors/AppError';

class CreateUser {
    async store(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            lastName: Yup.string().required(),
            email: Yup.string().required(),
            password: Yup.string().required().min(6),
        });

        try {
            await schema.validate(req.body);
        } catch (err) {
            if (err instanceof Error) {
                throw new AppError({
                    message: err.message,
                });
            }
        }

        const { team_id } = req.params;
        const { name, lastName, email, password } = req.body;

        const createdUser = await createAndAddUserOnTeam({
            name,
            lastName,
            email,
            password,
            team_id,
        });

        return res.status(201).json(createdUser);
    }
}

export default new CreateUser();
