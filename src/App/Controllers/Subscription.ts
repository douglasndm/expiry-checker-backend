import { Request, Response } from 'express';

import { getSubscription } from '@utils/Subscriptions/Subscription';
import { deleteSubscription } from '@utils/Subscriptions/Delete';

class SubscriptionController {
    async index(req: Request, res: Response): Promise<Response> {
        const { team_id } = req.params;

        const subscription = await getSubscription(team_id);

        return res.json(subscription);
    }

    async delete(req: Request, res: Response): Promise<Response> {
        const { team_id } = req.params;

        await deleteSubscription(team_id);

        return res.send();
    }
}

export default new SubscriptionController();
