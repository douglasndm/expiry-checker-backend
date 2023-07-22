import { Request, Response } from 'express';
import * as Yup from 'yup';

import { getProductsFromTeam } from '@utils/Team/Products';
import { getUserByFirebaseId } from '@utils/User/Find';

import AppError from '@errors/AppError';

class FindProductsController {
    async index(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            search: Yup.string().required(),
        });

        try {
            await schema.validate(req.query);
        } catch (error) {
            if (error instanceof Error) {
                throw new AppError({
                    message: error.message,
                });
            }
        }

        const { team_id } = req.params;
        const { removeCheckedBatches, sortByBatches, search } = req.query;

        const user = await getUserByFirebaseId(req.userId || '');

        const products = await getProductsFromTeam({
            team_id,
            user_id: user.id,
            removeCheckedBatches: Boolean(removeCheckedBatches),
            sortByBatches: Boolean(sortByBatches),
            search: String(search),
        });

        return res.json(products);
    }
}

export default new FindProductsController();
