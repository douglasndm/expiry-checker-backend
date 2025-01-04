import { Request, Response } from 'express';
import * as Yup from 'yup';

import { createProduct } from '@utils/Product/Create';
import { updateProduct } from '@utils/Product/Update';
import { getUserByFirebaseId } from '@utils/User/Find';
import { getUserRole } from '@utils/Team/Roles/Find';
import { deleteProduct } from '@utils/Product/Delete';

import { getProduct } from '@functions/Product';

import {
    getProductImageURL,
    getProductImageURLByFileName,
} from '@services/AWS';

import AppError from '@errors/AppError';

class ProductController {
    async index(req: Request, res: Response): Promise<Response> {
        const { product_id, team_id } = req.params;

        const product = await getProduct({
            product_id,
            team_id,
        });

        let thumbnail: string | null = null;

        if (product.image) {
            thumbnail = await getProductImageURLByFileName({
                fileName: product.image,
                team_id,
            });
        } else if (product.code) {
            thumbnail = await getProductImageURL(product.code);
        }

        const productWithFixCat = {
            ...product,
            thumbnail,
        };

        return res.status(200).json(productWithFixCat);
    }

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

    async update(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            name: Yup.string(),
            code: Yup.string().nullable(),
            brand: Yup.string().uuid().nullable(),
            brand_id: Yup.string().uuid().nullable(),
            store_id: Yup.string().uuid().nullable(),
            category_id: Yup.string().uuid().nullable(),
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

        const { product_id } = req.params;
        const { name, code, brand, brand_id, store_id, category_id } = req.body;

        const updatedProduct = await updateProduct({
            id: product_id,
            name,
            code,
            brand_id: brand_id || brand,
            store_id,
            category_id,
        });

        return res.status(201).json(updatedProduct);
    }

    async delete(req: Request, res: Response): Promise<Response> {
        if (!req.userId) {
            throw new AppError({
                message: 'Provide the user id',
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const { product_id, team_id } = req.params;

        const user = await getUserByFirebaseId(req.userId);

        const { role } = await getUserRole({ user_id: user.id, team_id });

        if (
            role.toLowerCase() !== 'manager' &&
            role.toLowerCase() !== 'supervisor'
        ) {
            throw new AppError({
                message: "You don't have authorization to be here",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        await deleteProduct({
            product_id,
        });

        return res.status(204).send();
    }
}

export default new ProductController();
