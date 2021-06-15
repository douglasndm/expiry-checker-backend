import { Request, Response } from 'express';
import * as Yup from 'yup';

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

        if (!(await schema.isValid(req.params))) {
            return res.status(400).json({ error: 'Team id is not valid' });
        }

        try {
            const { team_id } = req.params;

            const response = await checkSubscriptionOnRevenueCat(team_id);

            await checkSubscriptions({
                team_id,
                revenuecatSubscriptions: response,
            });
            const subs = await getTeamSubscription({ team_id });

            return res.status(200).json(subs);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
}

export default new SubscriptionController();
