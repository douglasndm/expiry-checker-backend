import { Request, Response } from 'express';
import { getRepository } from 'typeorm';

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

    async create(): Promise<void> {}
}

export default new ProductController();
