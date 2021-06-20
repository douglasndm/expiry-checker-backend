import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import AppError from '@errors/AppError';

import { Product } from '@models/Product';
import ProductTeams from '@models/ProductTeams';
import { Team } from '@models/Team';
import { Category } from '@models/Category';
import { Batch } from '@models/Batch';

import { checkIfUserHasAccessToAProduct } from '@utils/UserAccessProduct';
import { getAllUsersByTeam } from '@utils/Teams';
import { checkIfProductAlreadyExists } from '@utils/Products';
import {
    addProductToCategory,
    removeAllCategoriesFromProduct,
} from '@utils/Category/Products';
import { sortBatchesByExpDate } from '@utils/Batches';
import { getUserRole } from '@utils/Users/UserRoles';

class ProductController {
    async index(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            product_id: Yup.string().required().uuid(),
        });

        try {
            await schema.validate(req.params);
        } catch (err) {
            throw new AppError(err.message, 400);
        }

        if (!req.userId) {
            throw new AppError('Provide the user id', 401);
        }

        const { product_id } = req.params;

        const userHasAccessToProduct = await checkIfUserHasAccessToAProduct({
            product_id,
            user_id: req.userId,
        });

        if (!userHasAccessToProduct) {
            throw new AppError("You don't have authorization to be here", 401);
        }

        const reposity = getRepository(Product);

        const product = await reposity
            .createQueryBuilder('product')
            .where('product.id = :product_id', { product_id })
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
            throw new AppError(err.message, 400);
        }

        if (!req.userId) {
            throw new AppError('Provide the user id', 401);
        }

        const { name, code, categories, team_id } = req.body;

        const usersInTeam = await getAllUsersByTeam({ team_id });

        const isUserInTeam = usersInTeam.filter(ut => ut.id === req.userId);

        if (isUserInTeam.length <= 0) {
            throw new AppError("You don't have authorization to be here", 401);
        }

        const productAlreadyExists = await checkIfProductAlreadyExists({
            name,
            code,
            team_id,
        });

        if (productAlreadyExists) {
            throw new AppError(
                'This product already exists. Try add a new batch',
                400,
            );
        }

        const repository = getRepository(Product);
        const teamRepository = getRepository(Team);
        const productTeamRepository = getRepository(ProductTeams);

        const team = await teamRepository.findOne(team_id);

        if (!team) {
            throw new AppError('Team was not found', 400);
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
                throw new AppError('Category was not found', 400);
            }

            await addProductToCategory({
                product_id: prod.id,
                category,
            });
        }

        return res.status(201).json(savedProd);
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

        try {
            await schema.validate(req.body);
            await schemaParams.validate(req.params);
        } catch (err) {
            throw new AppError(err.message, 400);
        }

        if (!req.userId) {
            throw new AppError('Provide the user id', 401);
        }

        const { product_id } = req.params;
        const { name, code, categories } = req.body;

        const userHasAccessToProduct = await checkIfUserHasAccessToAProduct({
            product_id,
            user_id: req.userId,
        });

        if (!userHasAccessToProduct) {
            throw new AppError("You don't have authorization to be here", 401);
        }

        const productRepository = getRepository(Product);

        const product = await productRepository.findOne(product_id);

        if (!product) {
            throw new AppError('Product was not found', 400);
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
                throw new AppError('Category was not found', 400);
            }

            await addProductToCategory({
                product_id: updatedProduct.id,
                category,
            });
        }

        return res.status(200).json(updatedProduct);
    }

    async delete(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            product_id: Yup.string().required().uuid(),
        });

        try {
            await schema.validate(req.params);
        } catch (err) {
            throw new AppError(err.message, 400);
        }

        if (!req.userId) {
            throw new AppError('Provide the user id', 401);
        }

        const { product_id } = req.params;

        const productRepository = getRepository(Product);

        const prod = await productRepository
            .createQueryBuilder('prod')
            .leftJoinAndSelect('prod.team', 'prodTeam')
            .leftJoinAndSelect('prodTeam.team', 'team')
            .where('prod.id = :product_id', { product_id })
            .getOne();

        if (!prod) {
            throw new AppError('Product was not found', 400);
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
            throw new AppError("You don't have authorization to be here", 401);
        }

        await productRepository.remove(prod);

        return res.status(204).send();
    }
}

export default new ProductController();
