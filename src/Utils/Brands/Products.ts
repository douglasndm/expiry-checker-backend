import { defaultDataSource } from '@services/TypeORM';

import { getFromCache, saveOnCache } from '@services/Cache/Redis';

import Product from '@models/Product';

async function getAllProductsFromBrand({
    brand_id,
    team_id,
}: getAllProductsFromBrand): Promise<Product[]> {
    let productsInBrand = await getFromCache<Product[]>(
        `brand_products:${team_id}:${brand_id}`,
    );

    if (!productsInBrand) {
        const productRepository = defaultDataSource.getRepository(Product);

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

        await saveOnCache(
            `brand_products:${team_id}:${brand_id}`,
            productsInBrand,
        );
    }

    return productsInBrand;
}

export { getAllProductsFromBrand };
