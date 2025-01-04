import { defaultDataSource } from '@services/TypeORM';

import { invalidadeTeamCache } from '@services/Cache/Redis';

import Product from '@models/Product';

import { getProductById } from '../Get';

async function removeStoreFromProduct(product_id: string): Promise<void> {
    const prod = await getProductById({ product_id, includeStore: true });

    if (prod.store) {
        const repository = defaultDataSource.getRepository(Product);

        prod.store = null;

        await repository.save(prod);

        await invalidadeTeamCache(prod.team.team.id);
    }
}

export { removeStoreFromProduct };
