import { Request, Response } from 'express';

import { getExtraInformationsForProduct } from '@utils/Product/ExtraInfo';

class ProductExtraInformation {
    async index(req: Request, res: Response): Promise<Response> {
        const { team_id } = req.params;

        const informationsForProducts = await getExtraInformationsForProduct({
            team_id,
        });

        return res.json(informationsForProducts);
    }
}

export default new ProductExtraInformation();
