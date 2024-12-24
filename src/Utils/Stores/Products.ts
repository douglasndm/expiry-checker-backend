import * as Yup from 'yup';

import { defaultDataSource } from '@project/ormconfig';

import { getFromCache, saveOnCache } from '@services/Cache/Redis';

import Product from '@models/Product';

import AppError from '@errors/AppError';

interface getAllProductsFromStoreProps {
    store_id: string;
    team_id: string;
}

async function getAllProductsFromStore({
    store_id,
    team_id,
}: getAllProductsFromStoreProps): Promise<Product[]> {
    const schema = Yup.object().shape({
        store_id: Yup.string().required().uuid(),
    });

    try {
        await schema.validate({ store_id });
    } catch (err) {
        throw new AppError({
            message: 'Check store id',
            internalErrorCode: 1,
        });
    }

    let productsInStore = await getFromCache<Product[]>(
        `store_products:${team_id}:${store_id}`,
    );

    if (!productsInStore) {
        const productRepository = defaultDataSource.getRepository(Product);

        productsInStore = await productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.store', 'store')
            .leftJoinAndSelect('product.batches', 'batches')
            .where('store.id = :store_id', { store_id })
            .select([
                'product.id',
                'product.name',
                'product.code',
                'store.id',
                'store.name',
                'batches.id',
                'batches.name',
                'batches.exp_date',
                'batches.amount',
                'batches.price',
                'batches.status',
                'batches.price_tmp',
            ])
            .orderBy('batches.exp_date', 'ASC')
            .getMany();

        await saveOnCache(
            `store_products:${team_id}:${store_id}`,
            productsInStore,
        );
    }

    return productsInStore;
}

export { getAllProductsFromStore };
