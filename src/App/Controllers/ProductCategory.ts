import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import Category from '@models/Category';

import { getAllProductsFromCategory } from '@utils/Categories/Products';
import { getUserByFirebaseId } from '@utils/User/Find';
import { getAllStoresFromUser } from '@utils/Stores/Users';

import AppError from '@errors/AppError';

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
}

export default new ProductCategoryController();
