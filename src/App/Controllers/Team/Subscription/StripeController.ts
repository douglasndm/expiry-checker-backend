import { Request, Response } from 'express';

import { generateStripeCheckoutURL } from '@utils/Subscriptions/Stripe';

class StripeController {
	async store(req: Request, res: Response): Promise<Response> {
		const { team_id } = req.params;

		const checkoutUrl = await generateStripeCheckoutURL({ team_id });

		return res.json({ url: checkoutUrl });
	}
}

export default new StripeController();
