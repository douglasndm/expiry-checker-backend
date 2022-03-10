import { Request, Response } from 'express';
import * as Yup from 'yup';

import { getUserByFirebaseId } from '@utils/User/Find';
import { createProduct } from '@utils/Product/Create';

import { getAllUsersFromTeam } from '@functions/Team/Users';

import AppError from '@errors/AppError';

class ProductController {
    async create(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            code: Yup.string(),
            brand_id: Yup.string().uuid().nullable(),
            category_id: Yup.string().uuid().nullable(),
            store_id: Yup.string().uuid().nullable(),
        });

        try {
            await schema.validate(req.body);
        } catch (err) {
            if (err instanceof Error)
                throw new AppError({
                    message: err.message,
                    statusCode: 400,
                    internalErrorCode: 1,
                });
        }

        if (!req.userId) {
            throw new AppError({
                message: 'Provide the user id',
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const { team_id } = req.params;
        const { name, code, brand_id, category_id, store_id } = req.body;

        const usersInTeam = await getAllUsersFromTeam({ team_id });

        const isUserInTeam = usersInTeam.filter(ut => ut.id === req.userId);

        if (isUserInTeam.length <= 0) {
            throw new AppError({
                message: "You don't have authorization to be here",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const user = await getUserByFirebaseId(req.userId);

        const createdProd = await createProduct({
            name,
            code,
            brand_id,
            team_id,
            user_id: user.id,
            store_id,
            category_id,
        });

        return res.status(201).json(createdProd);
    }
}

export default new ProductController();
