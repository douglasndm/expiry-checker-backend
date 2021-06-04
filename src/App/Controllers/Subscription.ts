import { Request, Response } from 'express';
import axios from 'axios';
import * as Yup from 'yup';

import {
    checkSubscriptions,
    getAllSubscriptionsFromTeam,
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

            const response = await axios.get<IRevenueCatResponse>(
                `https://api.revenuecat.com/v1/subscribers/${team_id}`,
                {
                    headers: {
                        Authorization: process.env.REVENUECAT_API_KEY,
                    },
                },
            );

            await checkSubscriptions({
                team_id,
                revenuecatSubscriptions: response.data,
            });

            const subs = await getAllSubscriptionsFromTeam({ team_id });

            return res.status(200).json(subs);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
}

export default new SubscriptionController();
