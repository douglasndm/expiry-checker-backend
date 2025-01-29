import { defaultDataSource } from '@services/TypeORM';

import Product from '@models/Product';
import Store from '@models/Store';

async function getAllProductsFromStore(store_id: string): Promise<Product[]> {
	const productRepository = defaultDataSource.getRepository(Product);

	const products = await productRepository
		.createQueryBuilder('product')
		.leftJoinAndSelect('product.store', 'store')
		.where('store.id = :store_id', { store_id })
		.select(['product.id', 'product.name', 'product.code', 'product.image'])
		.getMany();

	return products;
}

export { getAllProductsFromStore };
