import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import { Product } from '../Models/Product';
import { Batch } from '../Models/Batch';

import { checkIfUserHasAccessToAProduct } from '../../Functions/UserAccessProduct';

class BatchController {
    async index(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Provider the batch id' });
        }

        try {
            const batchReposity = getRepository(Batch);

            const batch = await batchReposity.findOne({
                where: { id },
                relations: ['product'],
            });

            if (!batch) {
                return res.status(400).json({ error: 'Batch not found' });
            }

            const userHasAccess = await checkIfUserHasAccessToAProduct({
                product_id: batch.product.id,
                user_id: req.userId,
            });

            if (!userHasAccess) {
                return res
                    .status(401)
                    .json({ error: 'You dont have authorization to be here' });
            }

            return res.status(200).json(batch);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    async store(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            product_id: Yup.string().required().uuid(),
            name: Yup.string(),
            exp_date: Yup.date().required(),
            amount: Yup.number(),
            price: Yup.number(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation falis' });
        }

        try {
            const { product_id, name, exp_date, amount, price } = req.body;

            const userHasAccess = await checkIfUserHasAccessToAProduct({
                product_id,
                user_id: req.userId,
            });

            if (!userHasAccess) {
                return res
                    .status(401)
                    .json({ error: 'You dont have authorization to be here' });
            }

            const productRepository = getRepository(Product);
            const batchReposity = getRepository(Batch);

            const product = await productRepository.findOne(product_id);

            if (!product) {
                return res.status(400).json({ error: 'Product not found' });
            }

            const batch = new Batch();
            batch.name = name;
            batch.exp_date = exp_date;
            batch.amount = amount;
            batch.price = price;
            batch.status = 'unchecked';
            batch.product = product;

            const savedBatch = await batchReposity.save(batch);

            return res.status(200).json(savedBatch);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    async update(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            name: Yup.string(),
            exp_date: Yup.date(),
            amount: Yup.number(),
            price: Yup.number(),
            status: Yup.string(),
        });

        const schemaBatchId = Yup.object().shape({
            id: Yup.string().required().uuid(),
        });

        if (
            !(await schema.isValid(req.body)) ||
            !(await schemaBatchId.isValid(req.params))
        ) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        try {
            const { id } = req.params;
            const { name, exp_date, amount, price, status } = req.body;

            const batchReposity = getRepository(Batch);
            const batch = await batchReposity.findOne({
                where: { id },
                relations: ['product'],
            });

            if (!batch) {
                return res.status(400).json({ error: 'Batch not found' });
            }

            const userHasAccess = await checkIfUserHasAccessToAProduct({
                product_id: batch.product.id,
                user_id: req.userId,
            });

            if (!userHasAccess) {
                return res
                    .status(401)
                    .json({ error: 'You dont have authorization to be here' });
            }

            batch.name = name;
            batch.exp_date = exp_date;
            batch.amount = amount;
            batch.price = price;
            batch.status = String(status).toLowerCase();

            const updatedBatch = await batchReposity.save(batch);

            return res.status(200).json(updatedBatch);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
}

export default new BatchController();
