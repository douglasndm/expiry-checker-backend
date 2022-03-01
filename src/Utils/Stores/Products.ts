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
        .createQueryBuilder('products')
        .leftJoinAndSelect('products.store', 'store')
        .where('store.id = :store_id', { store_id })
        .getMany();

    return prodcuts;
}

export { getAllProductsFromStore };
