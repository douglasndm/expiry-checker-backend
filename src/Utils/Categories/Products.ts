import { defaultDataSource } from '@services/TypeORM';

import { getFromCache, saveOnCache } from '@services/Cache/Redis';

import Product from '@models/Product';

interface getAllProductsFromCategoryProps {
    category_id: string;
    team_id: string;
}

interface getAllProductsFromCategoryResponse {
    category_name: string;
    products: Product[];
}

async function getAllProductsFromCategory({
    category_id,
    team_id,
}: getAllProductsFromCategoryProps): Promise<getAllProductsFromCategoryResponse> {
    let productsInCategory = await getFromCache<Product[]>(
        `category_products:${team_id}:${category_id}`,
    );

    if (!productsInCategory) {
        const repository = defaultDataSource.getRepository(Product);

        productsInCategory = await repository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.batches', 'batches')
            .leftJoinAndSelect('product.team', 'team')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.store', 'store')
            .where('category.id = :id', { id: category_id })
            .select([
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

        await saveOnCache(
            `category_products:${team_id}:${category_id}`,
            productsInCategory,
        );
    }

    let category_name = '';

    if (productsInCategory && productsInCategory.length > 0) {
        category_name = productsInCategory[0]?.category?.name || '';
    }

    const response: getAllProductsFromCategoryResponse = {
        category_name,
        products: productsInCategory,
    };

    return response;
}

export { getAllProductsFromCategory };
