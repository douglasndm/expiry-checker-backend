import { Request, Response } from 'express';

import { getProductImageURL } from '@services/AWS';

import { findProductByEAN } from '@utils/ProductSearch/Find';

import AppError from '@errors/AppError';

class ProductInformationController {
	async index(req: Request, res: Response): Promise<Response> {
		const { ean } = req.params;

		const product = await findProductByEAN({ code: String(ean) });

		if (!product) {
			throw new AppError({
				message: 'Product not found',
				internalErrorCode: 8,
			});
		}

		let thumbnail: string | null = null;

		if (product?.code) {
			thumbnail = await getProductImageURL(product.code);
		}

		const productWithImage = {
			...product,
			thumbnail,
		};

		return res.json(productWithImage);
	}
}

export default new ProductInformationController();
