import { Request, Response } from 'express';

import { defaultDataSource } from '@services/TypeORM';

import Product from '@models/Product';

import { getAllProductsWithoutStore } from '@admin/utils/stores/products';
import { getStoreById } from '@admin/utils/stores/get';

class Move {
	async store(req: Request, res: Response): Promise<Response> {
		const { team_id, store_id } = req.params;

		const products = await getAllProductsWithoutStore(team_id);
		const store = await getStoreById(store_id);

		const productRepository = defaultDataSource.getRepository(Product);

		const updatedProducts = products.map(product => {
			product.store = store;
			return product;
		});

		await productRepository.save(updatedProducts);

		return res.status(201).send();
	}
}

export default new Move();
