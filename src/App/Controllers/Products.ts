import { Request, Response } from 'express';
import * as Yup from 'yup';

import { getUserByFirebaseId } from '@utils/User/Find';
import { getUserRoleInTeam } from '@utils/UserRoles';
import { deleteManyProducts } from '@utils/Product';

import AppError from '@errors/AppError';

class ProductsController {
    async delete(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            productsIds: Yup.array().of(Yup.string()).required(),
            team_id: Yup.string().uuid().required(),
        });

        try {
            await schema.validate(req.body);
        } catch (err) {
            if (err instanceof Error)
                throw new AppError({
                    message: err.message,
                    internalErrorCode: 34,
                });
        }

        const { productsIds, team_id } = req.body;

        const user = await getUserByFirebaseId(req.userId || '');

        const userRoles = await getUserRoleInTeam({
            user_id: user.id,
            team_id,
        });

        if (userRoles === 'manager' || userRoles === 'supervisor') {
            await deleteManyProducts({ productsIds, team_id });

            return res.status(200).send();
        }

        throw new AppError({
            message: "You don't have authorization to do that",
            internalErrorCode: 2,
            statusCode: 401,
        });
    }
}

export default new ProductsController();
