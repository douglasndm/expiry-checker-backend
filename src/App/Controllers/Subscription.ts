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

        const response = await checkSubscriptionOnRevenueCat(team_id);
        const { subscriptions } = response.subscriber;

        interface Subs {
            name: string;
            subscription: RevenueCatSubscription;
        }

        const allSubscription: Array<Subs> = [];

        if (subscriptions.expirybusiness_monthly_default_15people) {
            allSubscription.push({
                name: 'expirybusiness_monthly_default_15people',
                subscription:
                    subscriptions.expirybusiness_monthly_default_15people,
            });
        }
        if (subscriptions.expirybusiness_monthly_default_10people) {
            allSubscription.push({
                name: 'expirybusiness_monthly_default_10people',
                subscription:
                    subscriptions.expirybusiness_monthly_default_10people,
            });
        }
        if (subscriptions.expirybusiness_monthly_default_5people) {
            allSubscription.push({
                name: 'expirybusiness_monthly_default_5people',
                subscription:
                    subscriptions.expirybusiness_monthly_default_5people,
            });
        }
        if (subscriptions.expirybusiness_monthly_default_3people) {
            allSubscription.push({
                name: 'expirybusiness_monthly_default_3people',
                subscription:
                    subscriptions.expirybusiness_monthly_default_3people,
            });
        }
        if (subscriptions.expirybusiness_monthly_default_1person) {
            allSubscription.push({
                name: 'expirybusiness_monthly_default_1person',
                subscription:
                    subscriptions.expirybusiness_monthly_default_1person,
            });
        }

        return res.status(200).json(allSubscription);
    }
}

export default new SubscriptionController();
