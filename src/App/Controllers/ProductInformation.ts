import { Request, Response } from 'express';

import { getProductImageURL } from '@services/AWS';

import { findProductByEAN } from '@utils/ProductSearch/Find';

class ProductInformationController {
    async index(req: Request, res: Response): Promise<Response> {
        const { ean } = req.params;

        const product = await findProductByEAN({ code: String(ean) });

        const productWithImage = {
            ...product,
            thumbnail: product?.code ? getProductImageURL(product.code) : null,
        };

        return res.json(productWithImage);
    }
}

export default new ProductInformationController();
