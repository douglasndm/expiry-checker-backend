import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { parseISO, startOfDay } from 'date-fns';
import * as Yup from 'yup';

import AppError from '@errors/AppError';

import { Product } from '@models/Product';
import { Batch } from '@models/Batch';

import { checkIfUserHasAccessToAProduct } from '@utils/UserAccessProduct';
import { getUserRole } from '@utils/Users/UserRoles';

import Cache from '../../Services/Cache';

class BatchController {
    async index(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            batch_id: Yup.string().required().uuid(),
        });

        try {
            await schema.validate(req.params);
        } catch (err) {
            throw new AppError(err.message, 400);
        }

        if (!req.userId) {
            throw new AppError('Provide the user id', 401);
        }

        const { batch_id } = req.params;

        const batchReposity = getRepository(Batch);

        const batch = await batchReposity.findOne({
            where: { id: batch_id },
            relations: ['product'],
        });

        if (!batch) {
            throw new AppError('Batch was not found', 400);
        }

        const userHasAccess = await checkIfUserHasAccessToAProduct({
            product_id: batch.product.id,
            user_id: req.userId,
        });

        if (!userHasAccess) {
            throw new AppError("You don't have permission to be here", 401);
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
            throw new AppError(err.message, 400);
        }

        if (!req.userId) {
            throw new AppError('Provide the user id', 401);
        }

        const cache = new Cache();

        const { product_id, name, exp_date, amount, price } = req.body;

        const userHasAccess = await checkIfUserHasAccessToAProduct({
            product_id,
            user_id: req.userId,
        });

        if (!userHasAccess) {
            throw new AppError("You don't have permission to be here", 401);
        }

        const productRepository = getRepository(Product);
        const batchReposity = getRepository(Batch);

        const product = await productRepository.findOne(product_id);

        if (!product) {
            throw new AppError('Product not found', 400);
        }

        const date = startOfDay(parseISO(exp_date));

        const batch = new Batch();
        batch.name = name;
        batch.exp_date = date;
        batch.amount = amount;
        batch.price = price;
        batch.status = 'unchecked';
        batch.product = product;

        const savedBatch = await batchReposity.save(batch);

        await cache.invalidade(`products-from-teams:${product.team[0].id}`);

        return res.status(200).json(savedBatch);
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
            throw new AppError(err.message, 400);
        }

        if (!req.userId) {
            throw new AppError('Provide the user id', 401);
        }

        const cache = new Cache();

        const { batch_id } = req.params;
        const { name, exp_date, amount, price, status } = req.body;

        const batchReposity = getRepository(Batch);
        const batch = await batchReposity.findOne({
            where: { id: batch_id },
            relations: ['product'],
        });

        if (!batch) {
            throw new AppError('Batch was not found', 400);
        }

        const userHasAccess = await checkIfUserHasAccessToAProduct({
            product_id: batch.product.id,
            user_id: req.userId,
        });

        if (!userHasAccess) {
            throw new AppError("You don't have permission to be here", 401);
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

        await cache.invalidade(
            `products-from-teams:${batch.product.team[0].id}`,
        );

        return res.status(200).json(updatedBatch);
    }

    async delete(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            batch_id: Yup.string().required().uuid(),
        });

        try {
            await schema.validate(req.params);
        } catch (err) {
            throw new AppError(err.message, 400);
        }

        if (!req.userId) {
            throw new AppError('Provide the user id', 401);
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
            throw new AppError('Batch was not found', 400);
        }

        const userHasAccess = await checkIfUserHasAccessToAProduct({
            product_id: batch.product.id,
            user_id: req.userId,
        });
        const userRole = await getUserRole({
            user_id: req.userId,
            team_id: batch.product.team[0].team.id,
        });

        if (
            !userHasAccess ||
            (userHasAccess &&
                userRole !== 'Manager' &&
                userRole !== 'Supervisor')
        ) {
            throw new AppError("You don't have permission to be here", 401);
        }

        await batchReposity.remove(batch);

        await cache.invalidade(
            `products-from-teams:${batch.product.team[0].id}`,
        );

        return res.status(204).send();
    }
}

export default new BatchController();
