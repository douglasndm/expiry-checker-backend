import { Request, Response } from 'express';
import * as Yup from 'yup';

import { getSubscriptionPrice } from '@services/Stripe/getSubscription';

import AppError from '@errors/AppError';

class StripeSubscriptionController {
	async index(req: Request, res: Response): Promise<Response> {
		const schema = Yup.object().shape({
			subscription_name: Yup.string().required(),
		});

		try {
			await schema.validate(req.params);
		} catch (error) {
			if (error instanceof Error) {
				throw new AppError({
					message: error.message,
				});
			}
		}

		const subscription = await getSubscriptionPrice(
			req.params.subscription_name
		);

		return res.json(subscription);
	}
}
export default new StripeSubscriptionController();
