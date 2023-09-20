import { getRepository } from 'typeorm';

import ProductCategory from '@models/ProductCategory';

import Cache from '@services/Cache';

import { getProductById } from '../Get';

async function removeCategoryFromProduct(product_id: string): Promise<void> {
    const prod = await getProductById({ product_id, includeCategory: true });

    if (prod.category) {
        const repository = getRepository(ProductCategory);
        await repository.remove(prod.category);

        const cache = new Cache();
        await cache.invalidadeTeamCache(prod.team.team.id);
    }
}

export { removeCategoryFromProduct };
