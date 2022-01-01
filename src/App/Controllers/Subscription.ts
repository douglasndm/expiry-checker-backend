import { Request, Response } from 'express';

import { getTeamSubscription } from '@utils/Subscription';
import { recheckTemp } from '@functions/Subscriptions';

class SubscriptionController {
    async index(req: Request, res: Response): Promise<Response> {
        const { team_id } = req.params;

        // this is temporary while an app update will be prepare to fix it
        // Mobile app expect an empty response when no subscriptions are available
        // new method will responde an error
        try {
            const subscription = await getTeamSubscription(team_id);

            return res.json(subscription);
        } catch {
            return res.send();
        }
    }

    // TEMP FOR LEGACY
    async recheck(req: Request, res: Response): Promise<Response> {
        const { team_id } = req.params;

        const subscriptions = await recheckTemp(team_id);

        return res.json(subscriptions);
    }
}

export default new SubscriptionController();
