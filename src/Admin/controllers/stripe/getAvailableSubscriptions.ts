import { Request, Response } from 'express';

import { getAvailableSubscriptions } from '@services/Stripe/getAvailableSubscriptions';

class StripeSubscriptionController {
	async index(req: Request, res: Response): Promise<Response> {
		const availableSubscriptions = await getAvailableSubscriptions();

		return res.json(availableSubscriptions);
	}
}
export default new StripeSubscriptionController();
