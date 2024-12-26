import { Request, Response } from 'express';
import * as Yup from 'yup';

import { defaultDataSource } from '@services/TypeORM';

import { invalidadeCache } from '@services/Cache/Redis';

import Batch from '@models/Batch';

import { checkIfUserHasAccessToAProduct } from '@functions/UserAccessProduct';
import { getProductTeam } from '@functions/Product/Team';

import AppError from '@errors/AppError';

class BatchDiscount {
    async store(req: Request, res: Response): Promise<Response> {
        if (!req.userUUID) {
            throw new AppError({
                message: 'Provide the user id',
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const schema = Yup.object().shape({
            batch_id: Yup.string().uuid().required(),
            temp_price: Yup.number(),
        });

        try {
            await schema.validate(req.body);
        } catch (err) {
            if (err instanceof AppError)
                throw new AppError({
                    message: err.message,
                    internalErrorCode: 1,
                });
        }

        const { batch_id, temp_price } = req.body;

        const batchRepository = defaultDataSource.getRepository(Batch);
        const batch = await batchRepository
            .createQueryBuilder('batch')
            .leftJoinAndSelect('batch.product', 'product')
            .where('batch.id = :batch_id', { batch_id })
            .getOne();

        if (!batch) {
            throw new AppError({
                message: 'Batch not found',
                internalErrorCode: 9,
            });
        }

        const userHasAccess = await checkIfUserHasAccessToAProduct({
            product_id: batch?.product.id,
            user_id: req.userUUID,
        });

        if (!userHasAccess) {
            throw new AppError({
                message: "You don't have authorization to be here",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        batch.price_tmp = temp_price;

        const updatedBatch = await batchRepository.save(batch);

        const team = await getProductTeam(batch.product);

        await invalidadeCache(`team_products:${team.id}`);
        await invalidadeCache(`product:${team.id}:${batch.product.id}`);

        return res.status(201).json(updatedBatch);
    }
}

export default new BatchDiscount();
