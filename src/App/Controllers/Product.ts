import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import AppError from '@errors/AppError';

import Product from '@models/Product';
import Category from '@models/Category';

import { checkIfUserHasAccessToAProduct } from '@utils/UserAccessProduct';
import { getAllUsersFromTeam } from '@utils/Team/Users';
import {
    addProductToCategory,
    removeAllCategoriesFromProduct,
} from '@utils/Category/Products';
import { getUserRole } from '@utils/Users/UserRoles';
import { getProductTeam } from '@utils/Product/Team';

import { createProduct, getProduct } from '@utils/Product';
import Cache from '../../Services/Cache';

class ProductController {
    async index(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            product_id: Yup.string().required().uuid(),
        });

        try {
            await schema.validate(req.params);
        } catch (err) {
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

        const userHasAccessToProduct = await checkIfUserHasAccessToAProduct({
            product_id,
            user_id: req.userId,
        });

        if (!userHasAccessToProduct.hasAccess) {
            throw new AppError({
                message: "You don't have authorization to be here",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const product = await getProduct({
            product_id,
            team_id: userHasAccessToProduct.team?.id,
        });

        return res.status(200).json(product);
    }

    async create(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            code: Yup.string(),
            categories: Yup.array().of(Yup.string()),
            team_id: Yup.string().required().uuid(),
        });

        try {
            await schema.validate(req.body);
        } catch (err) {
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

        const { name, code, categories, team_id } = req.body;

        const usersInTeam = await getAllUsersFromTeam({ team_id });

        const isUserInTeam = usersInTeam.filter(ut => ut.id === req.userId);

        if (isUserInTeam.length <= 0) {
            throw new AppError({
                message: "You don't have authorization to be here",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const createdProd = await createProduct({
            name,
            code,
            team_id,
            categories,
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
            categories: Yup.array().of(Yup.string()),
        });

        try {
            await schema.validate(req.body);
            await schemaParams.validate(req.params);
        } catch (err) {
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

        const { product_id } = req.params;
        const { name, code, categories } = req.body;

        const userHasAccessToProduct = await checkIfUserHasAccessToAProduct({
            product_id,
            user_id: req.userId,
        });

        if (!userHasAccessToProduct) {
            throw new AppError({
                message: "You don't have authorization to be here",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const productRepository = getRepository(Product);

        const product = await productRepository.findOne(product_id);

        if (!product) {
            throw new AppError({
                message: 'Product was not found',
                statusCode: 400,
                internalErrorCode: 8,
            });
        }

        product.name = name;
        product.code = code;

        const updatedProduct = await productRepository.save(product);

        await removeAllCategoriesFromProduct({
            product_id: updatedProduct.id,
        });

        if (!!categories && categories.length > 0) {
            const categoryRepository = getRepository(Category);
            const category = await categoryRepository.findOne({
                where: {
                    id: categories[0],
                },
            });

            if (!category) {
                throw new AppError({
                    message: 'Category was not found',
                    statusCode: 400,
                    internalErrorCode: 10,
                });
            }

            await addProductToCategory({
                product_id: updatedProduct.id,
                category,
            });
        }

        const team = await getProductTeam(updatedProduct);

        await cache.invalidade(`products-from-teams:${team.id}`);
        await cache.invalidade(`product:${team.id}:${updatedProduct.id}`);

        return res.status(200).json(updatedProduct);
    }

    async delete(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            product_id: Yup.string().required().uuid(),
        });

        try {
            await schema.validate(req.params);
        } catch (err) {
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

        const { product_id } = req.params;

        const productRepository = getRepository(Product);

        const prod = await productRepository
            .createQueryBuilder('prod')
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

        const userHasAccess = await checkIfUserHasAccessToAProduct({
            product_id: prod.id,
            user_id: req.userId,
        });
        const userRole = await getUserRole({
            user_id: req.userId,
            team_id: team.id,
        });

        if (
            !userHasAccess ||
            (userHasAccess &&
                userRole !== 'Manager' &&
                userRole !== 'Supervisor')
        ) {
            throw new AppError({
                message: "You don't have authorization to be here",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        await cache.invalidade(`products-from-teams:${team.id}`);
        await cache.invalidade(`product:${team.id}:${prod.id}`);

        await productRepository.remove(prod);

        return res.status(204).send();
    }
}

export default new ProductController();
