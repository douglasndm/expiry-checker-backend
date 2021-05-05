import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import bcrypt from 'bcryptjs';
import * as Yup from 'yup';

import { User } from '../Models/User';

class UserController {
    async store(req: Request, res: Response): Promise<Response> {
        try {
            const schema = Yup.object().shape({
                name: Yup.string().required(),
                lastName: Yup.string().required(),
                email: Yup.string().required().email(),
                password: Yup.string().required(),
                passwordConfirmation: Yup.string().required(),
            });

            if (!(await schema.isValid(req.body))) {
                return res.status(400).json({ error: 'Validation fails' });
            }

            const {
                name,
                lastName,
                email,
                password,
                passwordConfirmation,
            } = req.body;

            if (password !== passwordConfirmation) {
                return res.status(400).json({
                    error: 'Password must be the same of password confirmation',
                });
            }

            const encryptyedPassword = await bcrypt.hash(password, 8);

            const user = new User();
            user.name = name;
            user.lastName = lastName;
            user.email = email;
            user.password = encryptyedPassword;

            const repository = getRepository(User);

            const savedUser = await repository.save(user);

            delete savedUser.password;

            return res.status(201).json(savedUser);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    async index(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;

            const repository = getRepository(User);

            const user = await repository.findOne({
                where: { id },
                relations: ['roles'],
            });

            if (!user) {
                return res.status(400).json({ error: 'User was not found' });
            }

            return res.status(200).json(user);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
}

export default new UserController();
