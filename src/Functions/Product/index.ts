import { getRepository } from 'typeorm';

import Cache from '@services/Cache';

import { checkIfProductAlreadyExists } from '@utils/Products';
import { sortBatchesByExpDate } from '@utils/Batches';
import { addProductToCategory } from '@utils/Category/Products';

import Product from '@models/Product';
import Category from '@models/Category';
import Batch from '@models/Batch';
import Team from '@models/Team';
import ProductCategory from '@models/ProductCategory';
import ProductTeams from '@models/ProductTeams';

import AppError from '@errors/AppError';

interface getProductProps {
    product_id: string;
}

export async function getProduct({
    product_id,
}: getProductProps): Promise<Product> {
    const cache = new Cache();

    const cachedProd = await cache.get<Product>(`product:${product_id}`);

    if (cachedProd) {
        return cachedProd;
    }

    const reposity = getRepository(Product);

    const product = await reposity
        .createQueryBuilder('product')
        .where('product.id = :product_id', { product_id })
        .leftJoinAndSelect('product.categories', 'categories')
        .leftJoinAndSelect('product.batches', 'batches')
        .leftJoinAndSelect('categories.category', 'category')
        .getOne();

    if (!product) {
        throw new AppError({
            message: 'Product not found',
            internalErrorCode: 8,
        });
    }

    const categories: Array<ProductCategory> = [];

    product.categories.forEach(cat => categories.push(cat));

    let batches: Array<Batch> = [];

    if (product?.batches) {
        batches = sortBatchesByExpDate(product.batches);
    }

    const organizedProduct = {
        ...product,
        categories,
        batches,
    };

    await cache.save(`product:${product_id}`, organizedProduct);

    return organizedProduct;
}

interface createProductProps {
    name: string;
    code?: string;
    team_id: string;
    categories?: Array<string>;
}

export async function createProduct({
    name,
    code,
    team_id,
    categories,
}: createProductProps): Promise<Product> {
    const cache = new Cache();

    const productAlreadyExists = await checkIfProductAlreadyExists({
        name,
        code,
        team_id,
    });

    if (productAlreadyExists) {
        throw new AppError({
            message: 'This product already exists. Try add a new batch',
            statusCode: 400,
            internalErrorCode: 11,
        });
    }

    const repository = getRepository(Product);
    const teamRepository = getRepository(Team);
    const productTeamRepository = getRepository(ProductTeams);

    const team = await teamRepository.findOne(team_id);

    if (!team) {
        throw new AppError({
            message: 'Team was not found',
            statusCode: 400,
            internalErrorCode: 6,
        });
    }

    const prod: Product = new Product();
    prod.name = name;
    prod.code = code || null;

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
            throw new AppError({
                message: 'Category was not found',
                statusCode: 400,
                internalErrorCode: 10,
            });
        }

        await addProductToCategory({
            product_id: prod.id,
            category,
        });
    }

    await cache.invalidade(`products-from-teams:${team_id}`);

    return savedProd;
}
