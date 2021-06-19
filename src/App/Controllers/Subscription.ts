import { Request, Response } from 'express';
import * as Yup from 'yup';

import AppError from '@errors/AppError';

import {
    checkSubscriptionOnRevenueCat,
    checkSubscriptions,
    getTeamSubscription,
} from '../../Functions/Subscriptions';

class SubscriptionController {
    async check(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            team_id: Yup.string().required().uuid(),
        });

        try {
            await schema.validate(req.params);
        } catch (err) {
            throw new AppError(err.message, 400);
        }

        const { team_id } = req.params;

        const response = await checkSubscriptionOnRevenueCat(team_id);

        await checkSubscriptions({
            team_id,
            revenuecatSubscriptions: response,
        });
        const subscription = await getTeamSubscription({ team_id });

        if (subscription) {
            return res.status(200).json(subscription);
        }

        return res.status(204).send();
    }
}

export default new SubscriptionController();
