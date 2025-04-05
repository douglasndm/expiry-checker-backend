import { Request, Response } from 'express';
import * as Yup from 'yup';

import { createProduct } from '@utils/ProductsSuggestions/Create';

import AppError from '@errors/AppError';

class ProductSuggestionsCreateController {
	async store(req: Request, res: Response): Promise<Response> {
		const schema = Yup.object().shape({
			name: Yup.string().required(),
			code: Yup.number().min(8).required(),
			brand: Yup.string(),
			ncm: Yup.string(),
			country: Yup.string(),
			image: Yup.string(),
			data_from: Yup.string(),
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

		await createProduct(req.body);

		return res.status(201).send('Product Created');
	}
}

export default new ProductSuggestionsCreateController();
