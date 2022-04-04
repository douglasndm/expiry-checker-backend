import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import Cache from '@services/Cache';

import Category from '@models/Category';
import ProductCategory from '@models/ProductCategory';

import { getAllProductsFromCategory } from '@utils/Categories/Products';
import { getUserByFirebaseId } from '@utils/User/Find';
import { getAllStoresFromUser } from '@utils/Stores/Users';

import { getProductTeam } from '@functions/Product/Team';

import AppError from '@errors/AppError';
import { getUserRole } from '@utils/Team/Roles/Find';
import { addToCategory } from '@utils/Product/Category/AddToCategory';

class ProductCategoryController {
    async index(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            category_id: Yup.string().required().uuid(),
        });

        try {
            await schema.validate(req.params);
        } catch (err) {
            throw new AppError({
                message: 'Check the category id',
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

        const { category_id } = req.params;

        const productsInCategory = await getAllProductsFromCategory({
            category_id,
        });

        let categoryName = productsInCategory.category_name;

        if (productsInCategory.category_name === '') {
            // This will return the category name even if no results where found
            const categoryRepository = getRepository(Category);
            const cate = await categoryRepository.findOne({
                where: {
                    id: category_id,
                },
            });

            if (!cate) {
                throw new AppError({
                    message: 'Category was not found',
                    statusCode: 400,
                    internalErrorCode: 10,
                });
            }

            categoryName = cate.name;
        }

        // REMOVE PRODUCTS FROM STORES THAT USER IS NOT IN
        const user = await getUserByFirebaseId(req.userId);
        const userStores = await getAllStoresFromUser({ user_id: user.id });

        if (userStores.length > 0) {
            const products = productsInCategory.products.filter(
                prod => prod.store?.id === userStores[0].store.id,
            );

            return res.json({
                category_name: categoryName,
                products,
            });
        }

        return res.json({
            category_name: categoryName,
            products: productsInCategory.products,
        });
    }

    async create(req: Request, res: Response): Promise<Response> {
        if (!req.userId) {
            throw new AppError({
                message: 'Provide the user id',
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const { id, category_id } = req.params;
        const { product_id } = req.body;

        await addToCategory({
            product_id,
            category_id: category_id || id,
        });

        return res.status(201).send();
    }

    async delete(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            id: Yup.string().required().uuid(),
        });
        const schemaBody = Yup.object().shape({
            product_id: Yup.string().required().uuid(),
        });

        try {
            await schema.validate(req.params);
            await schemaBody.validate(req.body);
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

        const { id, category_id } = req.params;
        const { product_id } = req.body;

        const repository = getRepository(ProductCategory);

        const exists = await repository
            .createQueryBuilder('prod_cat')
            .leftJoinAndSelect('prod_cat.category', 'category')
            .leftJoinAndSelect('prod_cat.product', 'product')
            .leftJoinAndSelect('product.team', 'team')
            .leftJoinAndSelect('team.team', 'temObj')
            .where('product.id = :product_id', { product_id })
            .andWhere('category.id = :category_id', {
                category_id: category_id || id,
            })
            .getOne();

        if (!exists) {
            throw new AppError({
                message: 'Product was not in category',
                statusCode: 400,
                internalErrorCode: 15,
            });
        }

        const team = await getProductTeam(exists.product);
        const user = await getUserByFirebaseId(req.userId);

        // This will throw an error if user isn't on team
        await getUserRole({ user_id: user.id, team_id: team.id });

        // This remove all products from team from cache cause categories could be changed
        const cache = new Cache();
        await cache.invalidadePrefix(`product:${team.id}:${product_id}`);

        await repository.remove(exists);

        return res
            .status(200)
            .json({ success: 'Product was removed from category' });
    }
}

export default new ProductCategoryController();
