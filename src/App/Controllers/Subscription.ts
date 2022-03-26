import { Request, Response } from 'express';
import * as Yup from 'yup';

import { getSubscription } from '@utils/Subscriptions/Subscription';

import AppError from '@errors/AppError';

class SubscriptionController {
    async index(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            team_id: Yup.string().required().uuid(),
        });

        try {
            await schema.validate(req.params);
        } catch (err) {
            if (err instanceof Error)
                throw new AppError({
                    message: err.message,
                });
        }

        const { team_id } = req.params;

        const subscription = await getSubscription(team_id);

        return res.json(subscription);
    }
}

export default new SubscriptionController();
