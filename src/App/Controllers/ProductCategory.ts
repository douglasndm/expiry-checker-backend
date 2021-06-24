import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import AppError from '@errors/AppError';

import { checkIfUserHasAccessToTeam } from '@utils/Security/UserAccessTeam';
import { addProductToCategory } from '@utils/Category/Products';

import { Category } from '@models/Category';
import { Product } from '@models/Product';
import ProductCategory from '@models/ProductCategory';

class ProductCategoryController {
    async index(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            category_id: Yup.string().required().uuid(),
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

        const { category_id } = req.params;

        const productCategoryRepository = getRepository(ProductCategory);
        const productsInCategory = await productCategoryRepository
            .createQueryBuilder('prod_cat')
            .leftJoinAndSelect('prod_cat.product', 'product')
            .leftJoinAndSelect('product.batches', 'batches')
            .leftJoinAndSelect('product.team', 'team')
            .leftJoinAndSelect('team.team', 'teamObj')
            .leftJoinAndSelect('prod_cat.category', 'category')
            .where('category.id = :id', { id: category_id })
            .orderBy('batches.exp_date', 'ASC')
            .getMany();

        if (productsInCategory.length <= 0) {
            return res.status(200).json({ category_name: '', products: [] });
        }

        const userHasAccess = await checkIfUserHasAccessToTeam({
            team_id: productsInCategory[0].product.team.team.id,
            user_id: req.userId,
        });

        if (!userHasAccess) {
            throw new AppError({
                message: "You don't have authorization to do this",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        let categoryName;

        const products: Array<
            Omit<Product, 'created_at' | 'updated_at' | 'categories'>
        > = [];

        productsInCategory.forEach(p =>
            products.push({
                id: p.product.id,
                name: p.product.name,
                code: p.product.code,
                team: p.product.team,
                batches: p.product.batches,
            }),
        );

        if (productsInCategory.length > 0) {
            categoryName = productsInCategory[0].category.name;
        } else {
            // This will return the category name even if no results where found
            const categoryRepository = getRepository(Category);
            const cate = await categoryRepository.findOne({
                where: {
                    id: category_id,
                },
            });

            categoryName = cate?.name;
            if (!cate) {
                throw new AppError({
                    message: 'Category was not found',
                    statusCode: 400,
                    internalErrorCode: 10,
                });
            }
        }

        return res.json({ category_name: categoryName, products });
    }

    async create(req: Request, res: Response): Promise<Response> {
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

        const { id } = req.params;
        const { product_id } = req.body;

        const categoryRepository = getRepository(Category);

        const category = await categoryRepository.findOne({
            where: { id },
            relations: ['team'],
        });

        if (!category) {
            throw new AppError({
                message: 'Category was not found',
                statusCode: 400,
                internalErrorCode: 10,
            });
        }

        const userHasAccess = await checkIfUserHasAccessToTeam({
            team_id: category.team.id,
            user_id: req.userId,
        });

        if (!userHasAccess) {
            throw new AppError({
                message: "You don't have authorization to do this",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const savedProductCategory = await addProductToCategory({
            category,
            product_id,
        });

        return res.status(200).json(savedProductCategory);
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

        const { id } = req.params;
        const { product_id } = req.body;

        const repository = getRepository(ProductCategory);

        const exists = await repository
            .createQueryBuilder('prod_cat')
            .leftJoinAndSelect('prod_cat.category', 'category')
            .leftJoinAndSelect('prod_cat.product', 'product')
            .leftJoinAndSelect('product.team', 'team')
            .leftJoinAndSelect('team.team', 'temObj')
            .where('product.id = :product_id', { product_id })
            .andWhere('category.id = :category_id', { category_id: id })
            .getOne();

        if (!exists) {
            throw new AppError({
                message: 'Product was not in category',
                statusCode: 400,
                internalErrorCode: 15,
            });
        }
        const userHasAccess = await checkIfUserHasAccessToTeam({
            team_id: exists.product.team.team.id,
            user_id: req.userId,
        });

        if (!userHasAccess) {
            throw new AppError({
                message: "You don't have authorization to do this",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        await repository.remove(exists);

        return res
            .status(200)
            .json({ success: 'Product was removed from category' });
    }
}

export default new ProductCategoryController();
