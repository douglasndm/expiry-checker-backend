import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import Cache from '@services/Cache';

import Batch from '@models/Batch';

import { findProductById } from '@utils/Product/Find';
import { getProductTeam } from '@functions/Product/Team';

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

    const team = await getProductTeam(product);

    const cache = new Cache();
    await cache.invalidade(`products-from-teams:${team.id}`);
    await cache.invalidade(`product:${team.id}:${product_id}`);

    if (product.store) {
        await cache.invalidade(`products-from-store:${product.store.id}`);
    }

    return createdBatch;
}

export { createBatch };
