import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import Product from '@models/Product';

import { createProduct } from '@utils/Product/Create';
import { updateProduct } from '@utils/Product/Update';
import { getUserByFirebaseId } from '@utils/User/Find';
import { getUserRole } from '@utils/Team/Roles/Find';

import { getProductTeam } from '@functions/Product/Team';
import { getProduct } from '@functions/Product';

import Cache from '@services/Cache';
import {
    getProductImageURL,
    getProductImageURLByFileName,
} from '@services/AWS';

import AppError from '@errors/AppError';

class ProductController {
    async index(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            product_id: Yup.string().required().uuid(),
        });

        try {
            await schema.validate(req.params);
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

        const { product_id, team_id } = req.params;

        const product = await getProduct({
            product_id,
            team_id,
        });

        let thumbnail: string | null = null;

        if (product.image) {
            thumbnail = getProductImageURLByFileName({
                fileName: product.image,
                team_id,
            });
        } else if (product.code) {
            thumbnail = getProductImageURL(product.code);
        }

        const productWithFixCat = {
            ...product,
            brand: product.brand?.id,
            category: product.category?.category,
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
        const schemaParams = Yup.object().shape({
            product_id: Yup.string().required().uuid(),
        });

        const schema = Yup.object().shape({
            name: Yup.string(),
            code: Yup.string().nullable(),
            brand: Yup.string().uuid().nullable(),
            store_id: Yup.string().uuid().nullable(),
            category_id: Yup.string().uuid().nullable(),
            categories: Yup.array().of(Yup.string()),
        });

        try {
            await schema.validate(req.body);
            await schemaParams.validate(req.params);
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
        const { name, code, brand, store_id, category_id, categories } =
            req.body;

        let cat_id: string = category_id;

        if (!cat_id && categories && categories.length > 0) {
            cat_id = String(categories[0]);
        }

        const updatedProduct = await updateProduct({
            id: product_id,
            name,
            code,
            brand_id: brand,
            store_id,
            category_id: cat_id,
        });
        return res.status(201).json(updatedProduct);
    }

    async delete(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            product_id: Yup.string().required().uuid(),
        });

        try {
            await schema.validate(req.params);
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

        const cache = new Cache();

        const { product_id, team_id } = req.params;

        const productRepository = getRepository(Product);

        const prod = await productRepository
            .createQueryBuilder('prod')
            .leftJoinAndSelect('prod.brand', 'brand')
            .leftJoinAndSelect('prod.store', 'store')
            .leftJoinAndSelect('prod.categories', 'prodCategories')
            .leftJoinAndSelect('prodCategories.category', 'category')
            .leftJoinAndSelect('prod.team', 'prodTeam')
            .leftJoinAndSelect('prodTeam.team', 'team')
            .where('prod.id = :product_id', { product_id })
            .getOne();

        if (!prod) {
            throw new AppError({
                message: 'Product was not found',
                statusCode: 400,
                internalErrorCode: 8,
            });
        }

        const team = await getProductTeam(prod);
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

        if (prod.category) {
            await cache.invalidade(
                `products-from-category:${prod.category.category.id}`,
            );
        }

        await cache.invalidade(`products-from-brand:${prod.brand?.id}`);
        await cache.invalidade(`products-from-teams:${team.id}`);
        await cache.invalidade(`product:${team.id}:${prod.id}`);

        if (prod.store) {
            await cache.invalidade(`products-from-store:${prod.store.id}`);
        }

        await productRepository.remove(prod);

        return res.status(204).send();
    }
}

export default new ProductController();
