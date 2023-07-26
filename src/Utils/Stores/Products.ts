import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import Product from '@models/Product';
import AppError from '@errors/AppError';

interface getAllProductsFromStoreProps {
    store_id: string;
}

async function getAllProductsFromStore({
    store_id,
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
    const productRepository = getRepository(Product);

    const prodcuts = await productRepository
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

    return prodcuts;
}

export { getAllProductsFromStore };
