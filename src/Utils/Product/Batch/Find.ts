import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import Batch from '@models/Batch';

import AppError from '@errors/AppError';

async function findBatchById(batch_id: string): Promise<Batch> {
    const schema = Yup.object().shape({
        batch_id: Yup.string().required().uuid(),
    });

    try {
        await schema.validate({ batch_id });
    } catch (err) {
        if (err instanceof Error)
            throw new AppError({
                message: err.message,
                statusCode: 400,
                internalErrorCode: 1,
            });
    }

    const repository = getRepository(Batch);
    const product = await repository
        .createQueryBuilder('batch')
        .leftJoinAndSelect('batch.product', 'product')
        .leftJoinAndSelect('product.store', 'store')
        .leftJoinAndSelect('product.brand', 'brand')
        .leftJoinAndSelect('product.category', 'prodCat')
        .leftJoinAndSelect('prodCat.category', 'category')
        .where('batch.id = :batch_id', { batch_id })
        .getOne();

    if (!product) {
        throw new AppError({
            message: 'Batch has not been found',
            statusCode: 400,
            internalErrorCode: 9,
        });
    }

    return product;
}

export { findBatchById };
