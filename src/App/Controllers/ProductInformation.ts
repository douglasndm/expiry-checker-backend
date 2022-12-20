import { Request, Response } from 'express';

import { getProductImageURL } from '@services/AWS';

import { findProductByEAN } from '@utils/ProductSearch/Find';

import AppError from '@errors/AppError';

class ProductInformationController {
    async index(req: Request, res: Response): Promise<Response> {
        const { ean } = req.params;

        if (!ean) {
            throw new AppError({ message: 'EAN is missing' });
        }

        const product = await findProductByEAN({ code: String(ean) });

        const productWithImage = {
            ...product,
            thumbnail: product?.code ? getProductImageURL(product.code) : null,
        };

        return res.json(productWithImage);
    }
}

export default new ProductInformationController();
