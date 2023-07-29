import { Request, Response } from 'express';
import * as Yup from 'yup';

import User from '@models/User';

import { removeUser, updateRole } from '@utils/Team/Roles/User';
import { addUserToTeam } from '@utils/Team/Roles/Create';
import { getUserByEmail } from '@utils/User/Find';

import AppError from '@errors/AppError';

class UserManagerController {
    async create(req: Request, res: Response): Promise<Response> {
        const schemaBody = Yup.object().shape({
            email: Yup.string().required().email(),
        });

        try {
            await schemaBody.validate(req.body);
        } catch (err) {
            if (err instanceof Error)
                throw new AppError({ message: err.message });
        }

        const { team_id } = req.params;
        const { email } = req.body;

        let user: User | null = null;

        try {
            user = await getUserByEmail(email);
        } catch (err) {
            if (err instanceof AppError) {
                if (err.errorCode === 7)
                    throw new AppError({
                        message: 'There is no user with this e-mail',
                        internalErrorCode: 18,
                    });
            } else {
                throw err;
            }
        }

        if (!user) {
            throw new AppError({
                message: 'There is no user with this e-mail',
                internalErrorCode: 18,
            });
        }

        const savedRole = await addUserToTeam({
            user_id: user.id,
            team_id,
        });

        return res.json(savedRole);
    }

    async update(req: Request, res: Response): Promise<Response> {
        const schemaBody = Yup.object().shape({
            user_id: Yup.string().required(),
            role: Yup.string(),
        });

        try {
            await schemaBody.validate(req.body);
        } catch (err) {
            if (err instanceof Error)
                throw new AppError({
                    message: err.message,
                    internalErrorCode: 1,
                });
        }

        const { team_id } = req.params;
        const { user_id, role } = req.body;

        if (role.toLowerCase() === 'manager') {
            throw new AppError({
                message: "You can't put another manager on team",
                statusCode: 400,
                internalErrorCode: 20,
            });
        }

        const updatedRole = await updateRole({
            role,
            team_id,
            user_id,
        });

        return res.json(updatedRole);
    }

    async delete(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            user_id: Yup.string().uuid().required('Provide the user id'),
        });

        try {
            await schema.validate(req.params);
        } catch (err) {
            if (err instanceof Error) {
                throw new AppError({ message: err.message });
            }
        }

        const { team_id, user_id } = req.params;

        if (req.userId === user_id) {
            throw new AppError({
                message: "You can't remove yourself from a team",
                statusCode: 401,
            });
        }

        await removeUser({ user_id, team_id });

        return res.status(204).send();
    }
}

export default new UserManagerController();
