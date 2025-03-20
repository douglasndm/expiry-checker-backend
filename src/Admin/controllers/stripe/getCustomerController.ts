import { Request, Response } from 'express';
import * as Yup from 'yup';

import { getCustomerByEmail } from '@services/Stripe/getCustomer';

import AppError from '@errors/AppError';

class StripeSubscriptionController {
	async index(req: Request, res: Response): Promise<Response> {
		const schema = Yup.object().shape({
			email: Yup.string().email().required(),
		});

		try {
			await schema.validate(req.query);
		} catch (error) {
			if (error instanceof Error) {
				throw new AppError({
					message: error.message,
				});
			}
		}

		const customer = await getCustomerByEmail(req.query.email as string);

		return res.json(customer);
	}
}
export default new StripeSubscriptionController();
