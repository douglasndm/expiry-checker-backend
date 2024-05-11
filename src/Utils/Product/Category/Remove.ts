import { getRepository } from 'typeorm';

import { invalidadeTeamCache } from '@services/Cache/Redis';

import ProductCategory from '@models/ProductCategory';

import { getProductById } from '../Get';

async function removeCategoryFromProduct(product_id: string): Promise<void> {
    const prod = await getProductById({ product_id, includeCategory: true });

    if (prod.category) {
        const repository = getRepository(ProductCategory);
        await repository.remove(prod.category);

        await invalidadeTeamCache(prod.team.team.id);
    }
}

export { removeCategoryFromProduct };
