import { Request, Response } from 'express';

import { getAllProductsFromStore } from '@utils/Stores/Products';

class StoreProducts {
    async index(req: Request, res: Response): Promise<Response> {
        const { store_id } = req.params;

        const products = await getAllProductsFromStore({ store_id });

        return res.json(products);
    }
}

export default new StoreProducts();
