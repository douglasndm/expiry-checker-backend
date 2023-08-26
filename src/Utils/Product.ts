import { getRepository } from 'typeorm';

import Cache from '@services/Cache';

import Product from '@models/Product';

export async function deleteManyProducts({
    productsIds,
    team_id,
}: deleteManyProductsProps): Promise<void> {
    const productRepository = getRepository(Product);

    // to do
    // remove images from s3
    const products = await productRepository
        .createQueryBuilder('product')
        .where('product.id IN (:...productsIds)', { productsIds })
        .getMany();

    if (products.length > 0) {
        await productRepository.remove(products);

        const cache = new Cache();
        await cache.invalidadeTeamCache(team_id);
    }
}
