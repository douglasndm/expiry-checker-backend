import { getRepository } from 'typeorm';

import Cache from '@services/Cache';

import ProductCategory from '@models/ProductCategory';

interface removeAllCategoriesFromProductProps {
    product_id: string;
}

export async function removeAllCategoriesFromProduct({
    product_id,
}: removeAllCategoriesFromProductProps): Promise<void> {
    const productCategoryRepository = getRepository(ProductCategory);

    const categoriesFinded = await productCategoryRepository.find({
        where: {
            product: {
                id: product_id,
            },
        },
    });

    if (categoriesFinded.length > 0) {
        const cache = new Cache();

        await cache.invalidade(
            `products-from-category:${categoriesFinded[0].category.id}`,
        );
    }

    await productCategoryRepository.remove(categoriesFinded);
}
