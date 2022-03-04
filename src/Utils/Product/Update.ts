import { getRepository } from 'typeorm';

import Product from '@models/Product';
import Category from '@models/Category';

import { getAllBrands } from '@utils/Brand';

import {
    addProductToCategory,
    removeAllCategoriesFromProduct,
} from '@functions/Category/Products';
import { getProductTeam } from '@functions/Product/Team';

import Cache from '@services/Cache';

import AppError from '@errors/AppError';
import { getAllStoresFromTeam } from '@utils/Stores/List';

interface updateProductProps {
    id: string;
    name?: string;
    code?: string;
    brand_id?: string;
    store_id?: string | null;
    categories?: string[];
}

async function updateProduct({
    id,
    name,
    code,
    brand_id,
    store_id,
    categories,
}: updateProductProps): Promise<Product> {
    const productRepository = getRepository(Product);
    const product = await productRepository.findOne(id);

    if (!product) {
        throw new AppError({
            message: 'Product was not found',
            statusCode: 400,
            internalErrorCode: 8,
        });
    }

    const team = await getProductTeam(product);

    const brands = await getAllBrands({ team_id: team.id });
    const findedBrand = brands.find(b => b.id === brand_id);

    const stores = await getAllStoresFromTeam({ team_id: team.id });
    const findedStore = stores.find(store => store.id === store_id);

    if (name) product.name = name;
    if (code) product.code = code;
    product.brand = findedBrand || null;
    product.store = findedStore || null;

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
            throw new AppError({
                message: 'Category was not found',
                statusCode: 400,
                internalErrorCode: 10,
            });
        }

        await addProductToCategory({
            product_id: updatedProduct.id,
            category,
        });
    }

    const cache = new Cache();
    await cache.invalidade(`products-from-teams:${team.id}`);
    await cache.invalidade(`product:${team.id}:${updatedProduct.id}`);

    return updatedProduct;
}

export { updateProduct };
