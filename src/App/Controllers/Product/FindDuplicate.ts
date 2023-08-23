import { Request, Response } from 'express';

import { isProductDuplicate } from '@utils/Product/FindDuplicate';

class FindDuplicateController {
    async index(req: Request, res: Response): Promise<Response> {
        const { code, store_id } = req.body;
        const { team_id } = req.params;

        const response = await isProductDuplicate({
            code,
            store_id,
            team_id,
        });

        return res.json(response);
    }
}

export default new FindDuplicateController();
