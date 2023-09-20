import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import Batch from '@models/Batch';

import { findProductById } from '@utils/Product/Find';
import { clearProductCache } from '@utils/Cache/Product';

import AppError from '@errors/AppError';

interface createBatchProps {
    product_id: string;
    name: string;
    exp_date: Date;
    amount: number;
    price: number;
}

async function createBatch({
    product_id,
    name,
    exp_date,
    amount,
    price,
}: createBatchProps): Promise<Batch> {
    const schema = Yup.object().shape({
        product_id: Yup.string().required().uuid(),
        name: Yup.string().required(),
        exp_date: Yup.date().required(),
        amount: Yup.number(),
        price: Yup.number(),
    });

    try {
        await schema.validate({ product_id, name, exp_date, amount, price });
    } catch (err) {
        if (err instanceof Error)
            throw new AppError({
                message: err.message,
                statusCode: 400,
                internalErrorCode: 1,
            });
    }

    const product = await findProductById(product_id);

    const batchReposity = getRepository(Batch);
    const batch = new Batch();
    batch.name = name;
    batch.exp_date = exp_date;
    batch.amount = amount;
    batch.price = price;
    batch.status = 'unchecked';
    batch.product = product;

    const createdBatch = await batchReposity.save(batch);

    await clearProductCache(product.id);

    return createdBatch;
}

export { createBatch };
