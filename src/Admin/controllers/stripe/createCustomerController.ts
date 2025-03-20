import { Request, Response } from 'express';
import * as Yup from 'yup';

import { createCustomer } from '@services/Stripe/createCustomer';

import AppError from '@errors/AppError';

class CreateCustomerController {
	async store(req: Request, res: Response): Promise<Response> {
		const schema = Yup.object().shape({
			name: Yup.string().required(),
			email: Yup.string().email().required(),
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

		const createdCustomer = await createCustomer(req.body);

		return res.json(createdCustomer);
	}
}

export default new CreateCustomerController();
