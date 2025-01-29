import { defaultDataSource } from '@services/TypeORM';

import Store from '@models/Store';

async function getStoreById(store_id: string): Promise<Store | null> {
	const repository = defaultDataSource.getRepository(Store);

	const store = await repository
		.createQueryBuilder('store')
		.where('store.id = :store_id', { store_id })
		.getOne();

	return store || null;
}

export { getStoreById };
