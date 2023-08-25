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
        .leftJoinAndSelect('product.team', 'prodTeam')
        .leftJoinAndSelect('prodTeam.team', 'team')
        .leftJoinAndSelect('prodCat.category', 'category')
        .where('product.id = :product_id', { product_id })
        .getOne();

    if (finded) {
        const cache = new Cache();

        const { team } = finded.product.team;

        await cache.invalidade(
            `category_products:${team.id}:${finded.category.id}`,
        );

        await repository.remove(finded);
    }
}
