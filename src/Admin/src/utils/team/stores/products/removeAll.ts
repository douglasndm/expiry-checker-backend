import { defaultDataSource } from '@services/TypeORM';

import Product from '@models/Product';

async function removeAllProductsStore(products: Product[]): Promise<void> {
	const productRepository = defaultDataSource.getRepository(Product);

	const updatedProducts = products.map(prod => ({
		...prod,
		store: null,
	}));

	await productRepository.save(updatedProducts);
}

export { removeAllProductsStore };
