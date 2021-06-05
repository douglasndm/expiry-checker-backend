import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import { Product } from '../Models/Product';
import ProductTeams from '../Models/ProductTeams';
import { Team } from '../Models/Team';
import { Category } from '../Models/Category';
import { Batch } from '../Models/Batch';

import { checkIfUserHasAccessToAProduct } from '../../Functions/UserAccessProduct';
import { getAllUsersByTeam } from '../../Functions/Teams';
import { checkIfProductAlreadyExists } from '../../Functions/Products';
import {
    addProductToCategory,
    removeAllCategoriesFromProduct,
} from '../../Functions/Category/Products';
import { sortBatchesByExpDate } from '../../Functions/Batches';
import { getUserRole } from '../../Functions/Users/UserRoles';

class ProductController {
    async show(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;

        try {
            const userHasAccessToProduct = await checkIfUserHasAccessToAProduct(
                {
                    product_id: id,
                    user_id: req.userId,
                },
            );

            if (!userHasAccessToProduct) {
                return res
                    .status(401)
                    .json({ error: 'You dont have authorization to do that' });
            }

            const reposity = getRepository(Product);

            const product = await reposity
                .createQueryBuilder('product')
                .where('product.id = :id', { id })
                .leftJoinAndSelect('product.categories', 'categories')
                .leftJoinAndSelect('product.batches', 'batches')
                .leftJoinAndSelect('categories.category', 'category')
                .getOne();

            const categories = product?.categories.map(cat => ({
                id: cat.category.id,
                name: cat.category.name,
            }));

            let batches: Array<Batch> = [];

            if (product?.batches) {
                batches = sortBatchesByExpDate(product.batches);
            }

            const organizedProduct = {
                ...product,
                categories,
                batches,
            };

            return res.status(200).json(organizedProduct);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    async create(req: Request, res: Response): Promise<Response> {
        try {
            const schema = Yup.object().shape({
                name: Yup.string().required(),
                code: Yup.string(),
                categories: Yup.array().of(Yup.string()),
                team_id: Yup.string().required().uuid(),
            });

            if (!(await schema.isValid(req.body))) {
                return res
                    .status(400)
                    .json({ error: 'Check the info provider' });
            }

            const { name, code, categories, team_id } = req.body;

            const usersInTeam = await getAllUsersByTeam({ team_id });

            const isUserInTeam = usersInTeam.filter(ut => ut.id === req.userId);

            if (isUserInTeam.length <= 0) {
                return res
                    .status(401)
                    .json({ error: 'You dont have authorization to be here' });
            }

            const productAlreadyExists = await checkIfProductAlreadyExists({
                name,
                code,
                team_id,
            });

            if (productAlreadyExists) {
                return res.status(400).json({
                    error: 'This product already exists. Try add a new batch',
                });
            }

            const repository = getRepository(Product);
            const teamRepository = getRepository(Team);
            const productTeamRepository = getRepository(ProductTeams);

            const team = await teamRepository.findOne(team_id);

            if (!team) {
                return res.status(400).json({ error: 'Team was not found' });
            }

            const prod: Product = new Product();
            prod.name = name;
            prod.code = code;

            const savedProd = await repository.save(prod);

            const productTeam = new ProductTeams();
            productTeam.product = savedProd;
            productTeam.team = team;

            await productTeamRepository.save(productTeam);

            if (!!categories && categories.length > 0) {
                const categoryRepository = getRepository(Category);
                const category = await categoryRepository.findOne({
                    where: {
                        id: categories[0],
                    },
                });

                if (!category) {
                    return res
                        .status(400)
                        .json({ error: 'Category was not found' });
                }

                await addProductToCategory({
                    product_id: prod.id,
                    category,
                });
            }

            return res.status(201).json(savedProd);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    async update(req: Request, res: Response): Promise<Response> {
        const schemaParams = Yup.object().shape({
            product_id: Yup.string().required().uuid(),
        });

        const schema = Yup.object().shape({
            name: Yup.string(),
            code: Yup.string(),
            categories: Yup.array().of(Yup.string()),
        });

        if (
            !(await schema.isValid(req.body)) ||
            !(await schemaParams.isValid(req.params))
        ) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        try {
            const { product_id } = req.params;
            const { name, code, categories } = req.body;

            const userHasAccessToProduct = await checkIfUserHasAccessToAProduct(
                {
                    product_id,
                    user_id: req.userId,
                },
            );

            if (!userHasAccessToProduct) {
                return res
                    .status(401)
                    .json({ error: 'You dont have authorization to do that' });
            }

            const productRepository = getRepository(Product);

            const product = await productRepository.findOne(product_id);

            if (!product) {
                return res.status(400).json({ error: 'Product not found' });
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
                    return res
                        .status(400)
                        .json({ error: 'Category was not found' });
                }

                await addProductToCategory({
                    product_id: updatedProduct.id,
                    category,
                });
            }

            return res.status(200).json(updatedProduct);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    async delete(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            product_id: Yup.string().required().uuid(),
        });

        if (!(await schema.isValid(req.params))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        try {
            const { product_id } = req.params;

            const productRepository = getRepository(Product);

            const prod = await productRepository
                .createQueryBuilder('prod')
                .leftJoinAndSelect('prod.team', 'prodTeam')
                .leftJoinAndSelect('prodTeam.team', 'team')
                .where('prod.id = :product_id', { product_id })
                .getOne();

            if (!prod) {
                return res.status(400).json({ error: 'Product was not found' });
            }

            const userHasAccess = await checkIfUserHasAccessToAProduct({
                product_id: prod.id,
                user_id: req.userId,
            });
            const userRole = await getUserRole({
                user_id: req.userId,
                team_id: prod.team[0].team.id,
            });

            if (
                !userHasAccess ||
                (userHasAccess &&
                    userRole !== 'Manager' &&
                    userRole !== 'Supervisor')
            ) {
                return res
                    .status(401)
                    .json({ error: "You don't have permission to do this" });
            }

            await productRepository.remove(prod);

            return res.json({ success: 'ok' });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
}

export default new ProductController();
