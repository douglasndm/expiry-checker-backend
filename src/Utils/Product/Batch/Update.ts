import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import Cache from '@services/Cache';

import { findBatchById } from '@utils/Product/Batch/Find';

import { getProductTeam } from '@functions/Product/Team';

import Batch from '@models/Batch';

import AppError from '@errors/AppError';

interface updateBatchProps {
    batch_id: string;
    name?: string;
    exp_date?: Date;
    amount?: number;
    price?: number;
    status?: 'checked' | 'unchecked';
    price_tmp?: number;
}

async function updateBatch({
    batch_id,
    name,
    exp_date,
    amount,
    price,
    status,
    price_tmp,
}: updateBatchProps): Promise<Batch> {
    const schema = Yup.object().shape({
        batch_id: Yup.string().uuid().required(),
        name: Yup.string(),
        exp_date: Yup.date(),
        amount: Yup.number(),
        price: Yup.number(),
        status: Yup.string(),
        price_tmp: Yup.number(),
    });

    try {
        await schema.validate({
            batch_id,
            name,
            exp_date,
            amount,
            price,
            status,
            price_tmp,
        });
    } catch (err) {
        if (err instanceof Error)
            throw new AppError({
                message: err.message,
                statusCode: 400,
                internalErrorCode: 1,
            });
    }

    const batchReposity = getRepository(Batch);

    const batch = await findBatchById(batch_id);

    if (name) batch.name = name;
    if (exp_date) batch.exp_date = exp_date;
    if (amount) batch.amount = amount;
    if (price) batch.price = price;
    if (price_tmp) batch.price_tmp = price_tmp;
    batch.status =
        String(status).toLowerCase() === 'checked' ? 'checked' : 'unchecked';

    const updatedBatch = await batchReposity.save(batch);

    const team = await getProductTeam(batch.product);

    const cache = new Cache();
    await cache.invalidade(`products-from-teams:${team.id}`);
    await cache.invalidade(`product:${team.id}:${batch.product.id}`);

    return updatedBatch;
}

export { updateBatch };
