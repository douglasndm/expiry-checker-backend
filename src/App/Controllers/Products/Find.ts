import { Request, Response } from 'express';

import { getProductsFromTeam } from '@utils/Team/Products';
import { getUserByFirebaseId } from '@utils/User/Find';

import AppError from '@errors/AppError';

class FindProductsController {
    async index(req: Request, res: Response): Promise<Response> {
        const { team_id } = req.params;
        const { removeCheckedBatches, sortByBatches, page, search } = req.query;

        if (!search) {
            throw new AppError({
                message: 'Enter a query',
            });
        }

        const user = await getUserByFirebaseId(req.userId || '');

        const pg = Number(page) <= 0 ? 0 : Number(page);

        const products = await getProductsFromTeam({
            team_id,
            user_id: user.id,
            page: page ? pg : undefined,
            removeCheckedBatches: Boolean(removeCheckedBatches),
            sortByBatches: Boolean(sortByBatches),
            search: String(search),
        });

        return res.json(products);
    }
}

export default new FindProductsController();
