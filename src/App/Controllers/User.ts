import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { compareAsc, startOfDay } from 'date-fns';
import * as Yup from 'yup';

import AppError from '@errors/AppError';

import User from '@models/User';

import { deleteUser, updateUser } from '@utils/Users';

class UserController {
    async store(req: Request, res: Response): Promise<Response> {
        try {
            const schema = Yup.object().shape({
                firebaseUid: Yup.string().required(),
                name: Yup.string(),
                lastName: Yup.string(),
                email: Yup.string().required().email(),
                password: Yup.string(),
                passwordConfirmation: Yup.string().oneOf(
                    [Yup.ref('password'), null],
                    'Confirmação da senha não corresponde a senha',
                ),
            });

            if (!(await schema.isValid(req.body))) {
                return res.status(400).json({ error: 'Validation fails' });
            }

            const {
                firebaseUid,
                name,
                lastName,
                email,
                password,
                passwordConfirmation,
            } = req.body;

            if (
                password &&
                passwordConfirmation &&
                password !== passwordConfirmation
            ) {
                return res.status(400).json({
                    error: 'Password must be the same of password confirmation',
                });
            }

            const repository = getRepository(User);
            const existsUser = await repository.findOne({ where: { email } });

            if (existsUser) {
                return res.status(400).json({ error: 'User already exists' });
            }

            const encryptyedPassword = null;

            if (password) await bcrypt.hash(password, 8);

            const user = new User();
            user.firebaseUid = firebaseUid;
            user.name = name;
            user.lastName = lastName;
            user.email = email;
            user.password = encryptyedPassword;

            const savedUser = await repository.save(user);

            delete savedUser.password;

            return res.status(201).json(savedUser);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    async index(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;

        const repository = getRepository(User);

        const user = await repository
            .createQueryBuilder('user')
            .where('user.firebaseUid = :id', { id })
            .leftJoinAndSelect('user.roles', 'roles')
            .leftJoinAndSelect('roles.team', 'team')
            .leftJoinAndSelect('team.subscriptions', 'subscriptions')
            .getOne();

        if (!user) {
            return res.status(400).json({ error: 'User was not found' });
        }

        const organizedUser = {
            id: user.firebaseUid,
            name: user.name,
            lastName: user.lastName,
            email: user.email,

            roles: user.roles.map(r => {
                const subscriptions = r.team.subscriptions.filter(
                    sub =>
                        compareAsc(
                            startOfDay(new Date()),
                            startOfDay(sub.expireIn),
                        ) <= 0,
                );

                return {
                    role: r.role,
                    status: r.status,
                    team: {
                        id: r.team.id,
                        name: r.team.name,
                        isActive: subscriptions.length > 0,
                    },
                };
            }),
        };

        return res.status(200).json(organizedUser);
    }

    async update(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            name: Yup.string(),
            lastName: Yup.string(),
            email: Yup.string().email('E-mail is not valid'),
            password: Yup.string(),
            passwordConfirmation: Yup.string().oneOf(
                [Yup.ref('password'), null],
                'Confirmação da senha não corresponde a senha',
            ),
        });
        const schemaParams = Yup.object().shape({
            user_id: Yup.string().required('Provider the user id'),
        });

        try {
            await schema.validate(req.body);
            await schemaParams.validate(req.params);
        } catch (err) {
            throw new AppError(err.message, 400);
        }

        const { user_id } = req.params;
        const { name, lastName } = req.body;

        const updatedUser = await updateUser({
            firebaseUid: user_id,
            name,
            lastName,
        });

        return res.status(200).json(updatedUser);
    }

    async delete(req: Request, res: Response): Promise<Response> {
        if (!req.userId) {
            throw new AppError('Provider the user id', 401);
        }

        await deleteUser({ user_id: req.userId });

        return res.status(204).send();
    }
}

export default new UserController();
