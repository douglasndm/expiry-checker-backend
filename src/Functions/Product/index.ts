import { getRepository } from 'typeorm';

import { getFromCache, saveOnCache } from '@services/Cache/Redis';

import { sortBatchesByExpDate } from '@utils/Product/Batch/Sort';

import Product from '@models/Product';
import Batch from '@models/Batch';

import AppError from '@errors/AppError';

interface getProductProps {
    product_id: string;
    team_id?: string;
}

export async function getProduct({
    product_id,
    team_id,
}: getProductProps): Promise<Product> {
    // We use team id cause when product is in a category and user remove it ou add it into a category
    // all products with that team id will be removed from cache
    if (team_id) {
        const cachedProd = await getFromCache<Product>(
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
        .leftJoinAndSelect('product.category', 'prodCat')
        .leftJoinAndSelect('product.batches', 'batches')
        .leftJoinAndSelect('prodCat.category', 'category')
        .select([
            'product.id',
            'product.name',
            'product.code',
            'product.image',
            'product.created_at',
            'product.updated_at',

            'brand.id',
            'brand.name',

            'store.id',
            'store.name',

            'prodCat',

            'category.id',
            'category.name',

            'batches.id',
            'batches.name',
            'batches.exp_date',
            'batches.amount',
            'batches.price',
            'batches.status',
            'batches.price_tmp',
            'batches.created_at',
            'batches.updated_at',
        ])
        .getOne();

    if (!product) {
        throw new AppError({
            message: 'Product not found',
            internalErrorCode: 8,
        });
    }

    let batches: Array<Batch> = [];

    if (product?.batches) {
        batches = sortBatchesByExpDate(product.batches);
    }

    const organizedProduct = {
        ...product,
        batches,
    };

    if (team_id) {
        await saveOnCache(`product:${team_id}:${product_id}`, organizedProduct);
    }

    return organizedProduct;
}
