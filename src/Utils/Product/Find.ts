import * as Yup from 'yup';

import { defaultDataSource } from '@services/TypeORM';

import Product from '@models/Product';

import AppError from '@errors/AppError';

async function findProductById(product_id: string): Promise<Product> {
    const schema = Yup.object().shape({
        product_id: Yup.string().required().uuid(),
    });

    try {
        await schema.validate({ product_id });
    } catch (err) {
        if (err instanceof Error)
            throw new AppError({
                message: err.message,
                statusCode: 400,
                internalErrorCode: 1,
            });
    }

    const productRepository = defaultDataSource.getRepository(Product);
    const product = await productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.team', 'prodTeam')
        .leftJoinAndSelect('prodTeam.team', 'team')
        .leftJoinAndSelect('product.store', 'store')
        .where('product.id = :product_id', { product_id })
        .getOne();

    if (!product) {
        throw new AppError({
            message: 'Product has not been found',
            statusCode: 400,
            internalErrorCode: 8,
        });
    }

    return product;
}

export { findProductById };
