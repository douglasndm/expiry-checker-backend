import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import { checkIfUserHasAccessToTeam } from '../../Functions/Security/UserAccessTeam';
import { addProductToCategory } from '../../Functions/Category/Products';

import { Category } from '../Models/Category';
import { Product } from '../Models/Product';
import ProductCategory from '../Models/ProductCategory';

class ProductCategoryController {
    async index(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            id: Yup.string().required().uuid(),
        });

        if (!(await schema.isValid(req.params))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        try {
            const { id } = req.params;

            const productCategoryRepository = getRepository(ProductCategory);
            const productsInCategory = await productCategoryRepository
                .createQueryBuilder('prod_cat')
                .leftJoinAndSelect('prod_cat.product', 'product')
                .leftJoinAndSelect('product.batches', 'batches')
                .leftJoinAndSelect('product.team', 'team')
                .leftJoinAndSelect('team.team', 'teamObj')
                .leftJoinAndSelect('prod_cat.category', 'category')
                .where('category.id = :id', { id })
                .getMany();

            if (productsInCategory.length <= 0) {
                return res
                    .status(200)
                    .json({ category_name: '', products: [] });
            }

            const userHasAccess = await checkIfUserHasAccessToTeam({
                team_id: productsInCategory[0].product.team[0].team.id,
                user_id: req.userId,
            });

            if (!userHasAccess) {
                return res
                    .status(401)
                    .json({ error: 'You dont have authorization to do this' });
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
                        id,
                    },
                });

                categoryName = cate?.name;
                if (!cate) {
                    return res
                        .status(400)
                        .json({ error: 'Category was not found' });
                }
            }

            return res.json({ category_name: categoryName, products });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    async create(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            id: Yup.string().required().uuid(),
        });
        const schemaBody = Yup.object().shape({
            product_id: Yup.string().required().uuid(),
        });

        if (
            !(await schema.isValid(req.params)) ||
            !(await schemaBody.isValid(req.body))
        ) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        try {
            const { id } = req.params;
            const { product_id } = req.body;

            const categoryRepository = getRepository(Category);

            const category = await categoryRepository.findOne({
                where: { id },
                relations: ['team'],
            });

            if (!category) {
                return res
                    .status(400)
                    .json({ error: 'Category was not found' });
            }

            const userHasAccess = await checkIfUserHasAccessToTeam({
                team_id: category.team.id,
                user_id: req.userId,
            });

            if (!userHasAccess) {
                return res
                    .status(401)
                    .json({ error: 'You dont have authorization to do this' });
            }

            const savedProductCategory = await addProductToCategory({
                category,
                product_id,
            });

            return res.status(200).json(savedProductCategory);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    async delete(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            id: Yup.string().required().uuid(),
        });
        const schemaBody = Yup.object().shape({
            product_id: Yup.string().required().uuid(),
        });

        if (
            !(await schema.isValid(req.params)) ||
            !(await schemaBody.isValid(req.body))
        ) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        try {
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
                return res
                    .status(400)
                    .json({ error: 'Product was not in category' });
            }
            const userHasAccess = await checkIfUserHasAccessToTeam({
                team_id: exists.product.team[0].team.id,
                user_id: req.userId,
            });

            if (!userHasAccess) {
                return res
                    .status(401)
                    .json({ error: 'You dont have authorization to do this' });
            }

            await repository.remove(exists);

            return res
                .status(200)
                .json({ success: 'Product was removed from category' });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
}

export default new ProductCategoryController();
