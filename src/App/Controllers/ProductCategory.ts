import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import { checkIfUserHasAccessToTeam } from '../../Functions/Security/UserAccessTeam';

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
                .leftJoinAndSelect('product.team', 'team')
                .leftJoinAndSelect('team.team', 'teamObj')
                .leftJoinAndSelect('prod_cat.category', 'category')
                .where('category.id = :id', { id })
                .getMany();

            const userHasAccess = await checkIfUserHasAccessToTeam({
                team_id: productsInCategory[0].product.team[0].team.id,
                user_id: req.userId,
            });

            if (!userHasAccess) {
                return res
                    .status(401)
                    .json({ error: 'You dont have authorization to do this' });
            }

            return res.json(productsInCategory);
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

            const productRepository = getRepository(Product);
            const categoryRepository = getRepository(Category);

            const product = await productRepository.findOne({
                where: { id: product_id },
            });
            const category = await categoryRepository.findOne({
                where: { id },
                relations: ['team'],
            });

            if (!product || !category) {
                return res
                    .status(400)
                    .json({ error: 'Category or Product was not found' });
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

            const repository = getRepository(ProductCategory);

            const alreadyExists = await repository.findOne({
                where: {
                    category: {
                        id,
                    },
                    product: {
                        id: product_id,
                    },
                },
            });

            if (alreadyExists) {
                return res
                    .status(400)
                    .json({ error: 'Product is already in category' });
            }

            const productCategory = new ProductCategory();
            productCategory.category = category;
            productCategory.product = product;

            const savedProductCategory = await repository.save(productCategory);

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
