import { Request, Response } from 'express';

import { getAllProductsFromStore } from '@utils/Stores/Products';

import { sortProductsByBatchesExpDate } from '@functions/Products';

class StoreProducts {
    async index(req: Request, res: Response): Promise<Response> {
        const { store_id, team_id } = req.params;

        const products = await getAllProductsFromStore({ store_id, team_id });

        const sortedProducts = sortProductsByBatchesExpDate(products);

        return res.json(sortedProducts);
    }
}

export default new StoreProducts();
