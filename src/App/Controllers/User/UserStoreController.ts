import { Request, Response } from 'express';
import * as Yup from 'yup';

import { getUserStoreOnTeam } from '@utils/Stores/Team';

import AppError from '@errors/AppError';

class UserStoreController {
    async index(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            team_id: Yup.string().required(),
        });

        try {
            await schema.validate(req.query);
        } catch (error) {
            if (error instanceof Error) {
                throw new AppError({ message: error.message });
            }
        }

        if (!req.userUUID) {
            return res
                .status(401)
                .json({ message: 'User UUID was not provided' });
        }

        const { team_id } = req.query;

        if (!team_id) {
            return res
                .status(400)
                .json({ message: 'Team ID was not provided' });
        }

        const store = await getUserStoreOnTeam({
            user_id: req.userUUID,
            team_id: team_id as string,
        });

        return res.json(store?.store || null);
    }
}

export default new UserStoreController();
