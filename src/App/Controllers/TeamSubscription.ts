import { Request, Response } from 'express';
import * as Yup from 'yup';

import AppError from '@errors/AppError';

import { checkIfUserHasAccessToTeam } from '../../Functions/Security/UserAccessTeam';
import { getTeamSubscription } from '../../Functions/Subscriptions';

class TeamSubscriptionsController {
    async index(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            team_id: Yup.string().required().uuid(),
        });

        try {
            await schema.validate(req.params);
        } catch (err) {
            throw new AppError(err.message, 400);
        }

        if (!req.userId) {
            throw new AppError("You don't have access to do that", 401);
        }

        const { team_id } = req.params;

        const userHasAccess = await checkIfUserHasAccessToTeam({
            user_id: req.userId,
            team_id,
        });

        if (!userHasAccess) {
            throw new AppError("You don't have access to do that", 401);
        }

        const response = await getTeamSubscription({ team_id });

        return res.json(response);
    }
}

export default new TeamSubscriptionsController();
