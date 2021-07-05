import { getRepository } from 'typeorm';

import Cache from '@services/Cache';

import { sortBatchesByExpDate } from '@utils/Batches';

import { Product } from '@models/Product';
import { Batch } from '@models/Batch';
import ProductCategory from '@models/ProductCategory';

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
