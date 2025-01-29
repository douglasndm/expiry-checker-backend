import { Request, Response } from 'express';
import * as Yup from 'yup';

import AppError from '@errors/AppError';

import { getAllProductsFromStore } from '@admin/utils/team/stores/products/getAll';
import { removeAllProductsStore } from '@admin/utils/team/stores/products/removeAll';

class RemoveAllController {
	async remove(req: Request, res: Response): Promise<Response> {
		const schema = Yup.object().shape({
			team_id: Yup.string().uuid().required(),
			store_id: Yup.string().uuid().required(),
		});

		try {
			await schema.validate(req.params);
		} catch (error) {
			if (error instanceof Error)
				throw new AppError({
					message: error.message,
					statusCode: 400,
					internalErrorCode: 1,
				});
		}

		const { store_id } = req.params;

		const products = await getAllProductsFromStore(store_id);
		await removeAllProductsStore(products);

		return res.send();
	}
}

export default new RemoveAllController();
