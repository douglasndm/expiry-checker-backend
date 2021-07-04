import { recheck } from '@utils/Team/Subscription';
import { Request, Response } from 'express';

import {
    checkSubscriptionOnRevenueCat,
    checkSubscriptions,
    getTeamSubscription,
} from '../../Functions/Subscriptions';

class SubscriptionController {
    async check(req: Request, res: Response): Promise<Response> {
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

    async recheck(req: Request, res: Response): Promise<Response> {
        const { team_id } = req.params;

        const subs = await recheck({ team_id });

        return res.status(200).json(subs);
    }
}

export default new SubscriptionController();
