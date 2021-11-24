import { Request, Response } from 'express';

import { recheck } from '@functions/Team/Subscription';
import {
    checkSubscriptionOnRevenueCat,
    checkSubscriptions,
    getTeamSubscription,
} from '@functions/Subscriptions';
import { getTeamAdmin } from '@utils/UserRoles';

class SubscriptionController {
    async check(req: Request, res: Response): Promise<Response> {
        const { team_id } = req.params;

        let response = await checkSubscriptionOnRevenueCat(team_id);

        // Check if subscriptions object is empty for TEAM ID, if true
        // check for subscription for the manager id
        if (Object.keys(response.subscriber.subscriptions).length <= 0) {
            console.log(
                `Team: ${team_id} does not have a subscription, checking for its manager`,
            );
            const admin = await getTeamAdmin(team_id);

            response = await checkSubscriptionOnRevenueCat(admin.firebaseUid);
        }

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
