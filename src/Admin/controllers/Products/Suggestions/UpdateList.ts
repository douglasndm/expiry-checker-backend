import { Request, Response } from 'express';

import { getProduct } from '@services/APIs/GTIN/Product';
import { saveProductOnFirestore } from '@utils/ProductSearch/Save';

import { getProductsRequestsByRank } from '@utils/ProductsSuggestions/GetRequests';
import { updateProductRequest } from '@utils/ProductsSuggestions/Request';

import AppError from '@errors/AppError';

class ProductSuggestionsUpdateListController {
	async update(req: Request, res: Response): Promise<Response> {
		const productsRequests = await getProductsRequestsByRank({
			limit: 20,
		});

		productsRequests.forEach(async request => {
			try {
				console.log('Getting product: ' + request.code);
				const product = await getProduct(request.code);

				console.log('Saving product: ' + request.code);
				await saveProductOnFirestore({
					name: product.nome,
					code: product.ean,
					brand: product.marca,
					image: product.link_foto,
					ncm: product.ncm,
					country: product.pais,
					data_from: 'API_GTIN',
				});

				//sleep to avoid rate limit
				await new Promise(resolve => setTimeout(resolve, 1000));
			} catch (error) {
				if (error instanceof AppError) {
					console.log(error.message);
					if (error.statusCode === 404) {
						await updateProductRequest({
							code: request.code,
							rank: request.rank,

							notFound: true,
							notFoundOn: 'API_GTIN',

							updatedAt: new Date(),
						});
					}
				} else {
					console.log(error);
					console.log('Error getting product: ' + request.code);
				}
			}
		});

		return res.json(productsRequests);
	}
}

export default new ProductSuggestionsUpdateListController();
