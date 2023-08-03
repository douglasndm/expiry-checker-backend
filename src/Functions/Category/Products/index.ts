import { getRepository } from 'typeorm';

import Cache from '@services/Cache';

import ProductCategory from '@models/ProductCategory';

interface removeAllCategoriesFromProductProps {
    product_id: string;
}

export async function removeAllCategoriesFromProduct({
    product_id,
}: removeAllCategoriesFromProductProps): Promise<void> {
    const repository = getRepository(ProductCategory);

    const finded = await repository
        .createQueryBuilder('prodCat')
        .leftJoinAndSelect('prodCat.product', 'product')
        .leftJoinAndSelect('prodCat.category', 'category')
        .where('product.id = :product_id', { product_id })
        .getOne();

    if (finded) {
        const cache = new Cache();

        await cache.invalidade(`products-from-category:${finded.category.id}`);

        await repository.remove(finded);
    }
}
