import { getRepository } from 'typeorm';

import Cache from '@services/Cache';

import Product from '@models/Product';

async function getAllProductsFromBrand({
    brand_id,
    team_id,
}: getAllProductsFromBrand): Promise<Product[]> {
    const cache = new Cache();

    let productsInBrand = await cache.get<Product[]>(
        `brand_products:${team_id}:${brand_id}`,
    );

    if (!productsInBrand) {
        const productRepository = getRepository(Product);

        productsInBrand = await productRepository
            .createQueryBuilder('prod')
            .leftJoinAndSelect('prod.batches', 'batches')
            .leftJoinAndSelect('prod.store', 'store')
            .where('prod.brand = :brand_id', { brand_id })
            .select([
                'prod.id',
                'prod.name',
                'prod.code',

                'batches.id',
                'batches.name',
                'batches.exp_date',
                'batches.amount',
                'batches.price',
                'batches.status',
                'batches.price_tmp',

                'store.id',
                'store.name',
            ])
            .getMany();

        await cache.save(
            `brand_products:${team_id}:${brand_id}`,
            productsInBrand,
        );
    }

    return productsInBrand;
}

export { getAllProductsFromBrand };
