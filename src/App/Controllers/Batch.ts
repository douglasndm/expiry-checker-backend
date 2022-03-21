import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import Cache from '@services/Cache';

import Product from '@models/Product';
import Batch from '@models/Batch';

import { getUserRoleInTeam } from '@utils/UserRoles';
import { getUserByFirebaseId } from '@utils/User/Find';
import { checkIfUserHasAccessToAProduct } from '@functions/UserAccessProduct';
import { getProductTeam } from '@functions/Product/Team';

import AppError from '@errors/AppError';

class BatchController {
    async index(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            batch_id: Yup.string().required().uuid(),
        });

        try {
            await schema.validate(req.params);
        } catch (err) {
            if (err instanceof Error)
                throw new AppError({
                    message: err.message,
                    statusCode: 400,
                    internalErrorCode: 1,
                });
        }

        if (!req.userId) {
            throw new AppError({
                message: 'Provide the user id',
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const { batch_id } = req.params;

        const batchReposity = getRepository(Batch);

        const batch = await batchReposity.findOne({
            where: { id: batch_id },
            relations: ['product'],
        });

        if (!batch) {
            throw new AppError({
                message: 'Batch was not found',
                statusCode: 400,
                internalErrorCode: 9,
            });
        }

        const userHasAccess = await checkIfUserHasAccessToAProduct({
            product_id: batch.product.id,
            user_id: req.userId,
        });

        if (!userHasAccess) {
            throw new AppError({
                message: "You don't have authorization to be here",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        return res.status(200).json(batch);
    }

    async store(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            product_id: Yup.string().required().uuid(),
            name: Yup.string(),
            exp_date: Yup.date().required(),
            amount: Yup.number(),
            price: Yup.number(),
        });

        try {
            await schema.validate(req.body);
        } catch (err) {
            if (err instanceof Error)
                throw new AppError({
                    message: err.message,
                    statusCode: 400,
                    internalErrorCode: 1,
                });
        }

        if (!req.userId) {
            throw new AppError({
                message: 'Provide the user id',
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const cache = new Cache();

        const { product_id, name, exp_date, amount, price } = req.body;

        const userHasAccess = await checkIfUserHasAccessToAProduct({
            product_id,
            user_id: req.userId,
        });

        if (!userHasAccess) {
            throw new AppError({
                message: "You don't have authorization to be here",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const productRepository = getRepository(Product);
        const batchReposity = getRepository(Batch);

        const product = await productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.team', 'team')
            .where('product.id = :product_id', { product_id })
            .getOne();

        if (!product) {
            throw new AppError({
                message: 'Product not found',
                statusCode: 400,
                internalErrorCode: 8,
            });
        }

        const batch = new Batch();
        batch.name = name;
        batch.exp_date = exp_date;
        batch.amount = amount;
        batch.price = price;
        batch.status = 'unchecked';
        batch.product = product;

        const savedBatch = await batchReposity.save(batch);

        const team = await getProductTeam(product);

        await cache.invalidade(`products-from-teams:${team.id}`);
        await cache.invalidade(`product:${team.id}:${product_id}`);

        return res.status(201).json(savedBatch);
    }

    async update(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            name: Yup.string(),
            exp_date: Yup.date(),
            amount: Yup.number(),
            price: Yup.number(),
            status: Yup.string(),
        });

        const schemaParams = Yup.object().shape({
            batch_id: Yup.string().required().uuid(),
        });

        try {
            await schemaParams.validate(req.params);
            await schema.validate(req.body);
        } catch (err) {
            if (err instanceof Error)
                throw new AppError({
                    message: err.message,
                    statusCode: 400,
                    internalErrorCode: 1,
                });
        }

        if (!req.userId) {
            throw new AppError({
                message: 'Provide the user id',
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const cache = new Cache();

        const { batch_id } = req.params;
        const { name, exp_date, amount, price, status } = req.body;

        const batchReposity = getRepository(Batch);

        const batch = await batchReposity
            .createQueryBuilder('batch')
            .leftJoinAndSelect('batch.product', 'product')
            .where('batch.id = :batch_id', { batch_id })
            .getOne();

        if (!batch) {
            throw new AppError({
                message: 'Batch was not found',
                statusCode: 400,
                internalErrorCode: 9,
            });
        }

        const userHasAccess = await checkIfUserHasAccessToAProduct({
            product_id: batch.product.id,
            user_id: req.userId,
        });

        if (!userHasAccess) {
            throw new AppError({
                message: "You don't have authorization to be here",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        batch.name = name;
        batch.exp_date = exp_date;
        batch.amount = amount;
        batch.price = price;
        batch.status =
            String(status).toLowerCase() === 'checked'
                ? 'checked'
                : 'unchecked';

        const updatedBatch = await batchReposity.save(batch);

        const team = await getProductTeam(batch.product);

        await cache.invalidade(`products-from-teams:${team.id}`);
        await cache.invalidade(`product:${team.id}:${batch.product.id}`);

        return res.status(200).json(updatedBatch);
    }

    async delete(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            batch_id: Yup.string().required().uuid(),
        });

        try {
            await schema.validate(req.params);
        } catch (err) {
            if (err instanceof Error)
                throw new AppError({
                    message: err.message,
                    statusCode: 400,
                    internalErrorCode: 1,
                });
        }

        if (!req.userId) {
            throw new AppError({
                message: 'Provide the user id',
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const cache = new Cache();

        const { batch_id } = req.params;

        const batchReposity = getRepository(Batch);

        const batch = await batchReposity
            .createQueryBuilder('batch')
            .leftJoinAndSelect('batch.product', 'product')
            .leftJoinAndSelect('product.team', 'prodTeam')
            .leftJoinAndSelect('prodTeam.team', 'team')
            .where('batch.id = :batch_id', { batch_id })
            .getOne();

        if (!batch) {
            throw new AppError({
                message: 'Batch was not found',
                statusCode: 400,
                internalErrorCode: 9,
            });
        }

        const team = await getProductTeam(batch.product);
        const user = await getUserByFirebaseId(req.userId);

        const userHasAccess = await checkIfUserHasAccessToAProduct({
            product_id: batch.product.id,
            user_id: req.userId,
        });
        const userRole = await getUserRoleInTeam({
            user_id: user.id,
            team_id: team.id,
        });

        if (
            !userHasAccess ||
            (userHasAccess &&
                userRole !== 'manager' &&
                userRole !== 'supervisor')
        ) {
            throw new AppError({
                message: "You don't have authorization to be here",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        await batchReposity.remove(batch);

        await cache.invalidade(`products-from-teams:${team.id}`);
        await cache.invalidade(`product:${team.id}:${batch.product.id}`);

        return res.status(204).send();
    }
}

export default new BatchController();
