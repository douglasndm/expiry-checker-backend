import { getRepository } from 'typeorm';

import Cache from '@services/Cache';

import Product from '@models/Product';
import ProductCategory from '@models/ProductCategory';

interface getAllProductsFromCategoryProps {
    category_id: string;
}

interface getAllProductsFromCategoryResponse {
    category_name: string;
    products: Product[];
}

async function getAllProductsFromCategory({
    category_id,
}: getAllProductsFromCategoryProps): Promise<getAllProductsFromCategoryResponse> {
    const cache = new Cache();

    let productsInCategory = await cache.get<ProductCategory[]>(
        `products-from-category:${category_id}`,
    );

    if (!productsInCategory) {
        const productCategoryRepository = getRepository(ProductCategory);

        productsInCategory = await productCategoryRepository
            .createQueryBuilder('prod_cat')
            .leftJoinAndSelect('prod_cat.product', 'product')
            .leftJoinAndSelect('product.batches', 'batches')
            .leftJoinAndSelect('product.team', 'team')
            .leftJoinAndSelect('product.store', 'store')
            .leftJoinAndSelect('team.team', 'teamObj')
            .leftJoinAndSelect('prod_cat.category', 'category')
            .where('category.id = :id', { id: category_id })
            .select([
                'prod_cat',
                'category.id',
                'category.name',

                'product.id',
                'product.name',
                'product.code',

                'batches.id',
                'batches.name',
                'batches.exp_date',
                'batches.amount',
                'batches.price',
                'batches.status',
                'batches.price_tmp',

                'store.id',
                'store.name',
            ])
            .orderBy('batches.exp_date', 'ASC')
            .getMany();

        await cache.save(
            `products-from-category:${category_id}`,
            productsInCategory,
        );
    }

    const products = productsInCategory.map(pc => pc.product);

    const response: getAllProductsFromCategoryResponse = {
        category_name:
            productsInCategory.length > 0
                ? productsInCategory[0].category.name
                : '',
        products,
    };

    return response;
}

export { getAllProductsFromCategory };
