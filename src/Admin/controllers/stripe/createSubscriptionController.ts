import { Request, Response } from 'express';
import * as Yup from 'yup';

import { getCustomerByEmail } from '@services/Stripe/getCustomer';
import { createSubscriptionAndPaymentLink } from '@services/Stripe/createSubscription';

import AppError from '@errors/AppError';

class CreateSubscriptionController {
	async store(req: Request, res: Response): Promise<Response> {
		const schema = Yup.object().shape({
			email: Yup.string().email().required(),
			priceId: Yup.string().required(),
		});

		try {
			await schema.validate(req.body);
		} catch (error) {
			if (error instanceof Error) {
				throw new AppError({
					message: error.message,
				});
			}
		}

		const customer = await getCustomerByEmail(req.body.email);

		if (!customer) {
			throw new AppError({
				message: 'Customer not found',
			});
		}

		const session = await createSubscriptionAndPaymentLink({
			customerId: customer.id,
			priceId: req.body.priceId,
			successUrl: `https://controledevalidades.com/teams-subscription-success/`,
			cancelUrl: `https://controledevalidades.com/teams-subscription-cancel/`,
		});

		return res.json(session);
	}
}

export default new CreateSubscriptionController();
