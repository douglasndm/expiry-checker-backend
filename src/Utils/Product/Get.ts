import * as Yup from 'yup';

import { defaultDataSource } from '@services/TypeORM';

import Product from '@models/Product';

import AppError from '@errors/AppError';

interface Props {
    product_id: string;
    includeBrand?: boolean;
    includeCategory?: boolean;
    includeStore?: boolean;
}

async function getProductById(props: Props): Promise<Product> {
    const { product_id, includeBrand, includeCategory, includeStore } = props;

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
    const query = productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.team', 'team')
        .where('product.id = :product_id', { product_id });

    if (includeCategory) {
        query.leftJoinAndSelect('product.category', 'category');
    }

    if (includeStore) {
        query.leftJoinAndSelect('product.store', 'store');
    }

    if (includeBrand) {
        query.leftJoinAndSelect('product.brand', 'brand');
    }

    const product = await query.getOne();

    if (!product) {
        throw new AppError({
            message: 'Product has not been found',
            statusCode: 400,
            internalErrorCode: 8,
        });
    }

    return product;
}

export { getProductById };
