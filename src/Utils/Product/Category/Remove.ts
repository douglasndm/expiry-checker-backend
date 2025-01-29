import { defaultDataSource } from '@services/TypeORM';

import { clearProductCache } from '@utils/Cache/Product';

import Product from '@models/Product';

import AppError from '@errors/AppError';

async function removeProductFromCategory(product_id: string): Promise<void> {
	const productRepository = defaultDataSource.getRepository(Product);

	const product = await productRepository
		.createQueryBuilder('product')
		.where('product.id = :product_id', { product_id })
		.leftJoinAndSelect('product.category', 'category')
		.getOne();

	if (!product) {
		throw new AppError({
			internalErrorCode: 8,
			message: 'Product not found',
		});
	}

	if (product.category) {
		product.category = null;

		await productRepository.save(product);

		await clearProductCache(product.id);
	}
}
export { removeProductFromCategory };
