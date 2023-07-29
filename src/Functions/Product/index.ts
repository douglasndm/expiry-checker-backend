import { getRepository } from 'typeorm';

import Cache from '@services/Cache';

import { sortBatchesByExpDate } from '@utils/Product/Batch/Sort';

import Product from '@models/Product';
import Batch from '@models/Batch';
import ProductCategory from '@models/ProductCategory';

import AppError from '@errors/AppError';

interface getProductProps {
    product_id: string;
    team_id?: string;
}

export async function getProduct({
    product_id,
    team_id,
}: getProductProps): Promise<Product> {
    const cache = new Cache();
    // We use team id cause when product is in a category and user remove it ou add it into a category
    // all products with that team id will be removed from cache
    if (team_id) {
        const cachedProd = await cache.get<Product>(
            `product:${team_id}:${product_id}`,
        );

        if (cachedProd) {
            return cachedProd;
        }
    }

    const reposity = getRepository(Product);

    const product = await reposity
        .createQueryBuilder('product')
        .where('product.id = :product_id', { product_id })
        .leftJoinAndSelect('product.brand', 'brand')
        .leftJoinAndSelect('product.store', 'store')
        .leftJoinAndSelect('product.categories', 'categories')
        .leftJoinAndSelect('product.batches', 'batches')
        .leftJoinAndSelect('categories.category', 'category')
        .select([
            'product.id',
            'product.name',
            'product.code',

            'brand.id',
            'brand.name',

            'store.id',
            'store.name',

            'categories',

            'category.id',
            'category.name',

            'batches.id',
            'batches.name',
            'batches.exp_date',
            'batches.amount',
            'batches.price',
            'batches.status',
            'batches.price_tmp',
        ])
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
        category: categories.length > 0 ? categories[0].category : undefined,
        categories,
        batches,
    };

    if (team_id) {
        await cache.save(`product:${team_id}:${product_id}`, organizedProduct);
    }

    return organizedProduct;
}
