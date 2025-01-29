import { defaultDataSource } from '@services/TypeORM';

import Product from '@models/Product';

async function getAllProductsWithoutStore(team_id: string): Promise<Product[]> {
	const productRepository = defaultDataSource.getRepository(Product);

	const products = await productRepository
		.createQueryBuilder('product')
		.leftJoinAndSelect('product.team', 'team')
		.leftJoinAndSelect('product.store', 'store')
		.leftJoinAndSelect('product.batches', 'batches')
		.where('team.id = :team_id', { team_id })
		.andWhere('store IS NULL')
		.select([
			'product.id',
			'product.name',
			'product.code',

			'store',

			'batches.id',
			'batches.name',
			'batches.exp_date',
			'batches.amount',
			'batches.price',
			'batches.status',
			'batches.price_tmp',
		])
		.orderBy('batches.exp_date', 'ASC')
		.getMany();

	return products;
}

export { getAllProductsWithoutStore };
