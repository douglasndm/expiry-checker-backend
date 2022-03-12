import { Request, Response } from 'express';

import { findProductByEAN } from '@utils/ProductSearch/Find';

import AppError from '@errors/AppError';

class ProductSearchController {
    async index(req: Request, res: Response): Promise<Response> {
        const { query } = req.query;

        if (!query) {
            throw new AppError({ message: 'Query is missing' });
        }

        const products = await findProductByEAN({ code: query });

        return res.json(products);
    }
}

export default new ProductSearchController();
