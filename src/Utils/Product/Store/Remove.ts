import { getRepository } from 'typeorm';

import Product from '@models/Product';

import Cache from '@services/Cache';

import { getProductById } from '../Get';

async function removeStoreFromProduct(product_id: string): Promise<void> {
    const prod = await getProductById({ product_id, includeStore: true });

    if (prod.store) {
        const repository = getRepository(Product);

        prod.store = null;

        await repository.save(prod);

        const cache = new Cache();
        await cache.invalidadeTeamCache(prod.team.team.id);
    }
}

export { removeStoreFromProduct };
