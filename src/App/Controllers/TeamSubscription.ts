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
            if (err instanceof Error)
                throw new AppError({ message: err.message });
        }

        if (!req.userId) {
            throw new AppError({
                message: "You don't have access to do that",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const { team_id } = req.params;

        const userHasAccess = await checkIfUserHasAccessToTeam({
            user_id: req.userId,
            team_id,
        });

        if (!userHasAccess) {
            throw new AppError({
                message: "You don't have access to do that",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const subscription = await getTeamSubscription({ team_id });

        if (subscription) {
            return res.status(200).json(subscription);
        }

        return res.status(204).send();
    }
}

export default new TeamSubscriptionsController();
