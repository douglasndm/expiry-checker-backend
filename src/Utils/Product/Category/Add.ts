import { defaultDataSource } from '@services/TypeORM';

import { clearProductCache } from '@utils/Cache/Product';

import Category from '@models/Category';
import Product from '@models/Product';

import AppError from '@errors/AppError';

interface Props {
	product_id: string;
	category_id: string;
}

async function addProductToCategory(props: Props): Promise<void> {
	const { product_id, category_id } = props;

	const productRepository = defaultDataSource.getRepository(Product);
	const categoryRepository = defaultDataSource.getRepository(Category);

	const product = await productRepository
		.createQueryBuilder('product')
		.where('product.id = :product_id', { product_id })
		.getOne();

	const category = await categoryRepository
		.createQueryBuilder('category')
		.where('category.id = :category_id', { category_id })
		.getOne();

	if (!product) {
		throw new AppError({
			internalErrorCode: 8,
			message: 'Product not found',
		});
	}

	if (!category) {
		throw new AppError({
			internalErrorCode: 10,
			message: 'Category not found',
		});
	}

	product.category = category;

	await productRepository.save(product);

	await clearProductCache(product.id);
}

export { addProductToCategory };
