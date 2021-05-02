import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';
import { string } from 'yup/lib/locale';

import { Product } from '../Models/Product';

class ProductController {
    async show(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;

        try {
            const reposity = getRepository(Product);

            const product = await reposity.findOne(id);

            return res.status(200).json(product);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    async create(req: Request, res: Response): Promise<Response> {
        try {
            const { name, code } = req.body;

            const schema = Yup.object().shape({
                name: Yup.string().required(),
                code: Yup.string(),
            });

            if (!(await schema.isValid(req.body))) {
                return res
                    .status(400)
                    .json({ error: 'Check the info provider' });
            }

            const prod: Product = new Product();
            prod.name = name;
            prod.code = code;

            const repository = getRepository(Product);

            const response = await repository.save(prod);

            return res.status(201).json(response);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
}

export default new ProductController();
