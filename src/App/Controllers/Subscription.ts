import { Request, Response } from 'express';

import {
    getExternalSubscriptionByTeamId,
    getSubscription,
} from '@utils/Subscriptions/Subscription';
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

    async storeData(req: Request, res: Response): Promise<Response> {
        const { team_id } = req.params;

        const response = await getExternalSubscriptionByTeamId(team_id);

        return res.json(response);
    }
}

export default new SubscriptionController();
