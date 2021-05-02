import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import { User } from '../Models/User';

import AuthConfig from '../Config/Auth';

class SessionController {
    async store(req: Request, res: Response): Promise<Response> {
        try {
            const schema = Yup.object().shape({
                email: Yup.string()
                    .required('Your email is required')
                    .email('Enter a valid email'),
                password: Yup.string().required('Your password is required'),
            });

            if (!(await schema.isValid(req.body))) {
                return res.status(400).json({ error: 'Validation fails' });
            }

            const { email, password } = req.body;

            const repository = getRepository(User);

            const user = await repository.findOne({
                where: {
                    email,
                },
            });

            if (!user) {
                return res
                    .status(401)
                    .json({ error: 'Email or password is not valid' });
            }

            const passwordResult = await bcrypt.compare(
                password,
                user.password,
            );

            if (!passwordResult) {
                return res
                    .status(401)
                    .json({ error: 'Email or password is not valid' });
            }

            const { id, name, lastName } = user;

            if (!AuthConfig.secret) {
                return res
                    .status(500)
                    .json({ error: 'Server is missing some variables' });
            }

            return res.status(200).json({
                user: {
                    id,
                    name,
                    lastName,
                    email,
                },
                token: jwt.sign({ id }, AuthConfig.secret, {
                    expiresIn: AuthConfig.expiresIn,
                }),
            });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
}

export default new SessionController();
