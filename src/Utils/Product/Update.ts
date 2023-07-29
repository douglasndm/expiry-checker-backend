import { getRepository } from 'typeorm';

import Cache from '@services/Cache';

import Product from '@models/Product';
import Category from '@models/Category';

import { getAllBrands } from '@utils/Brand';
import { getAllStoresFromTeam } from '@utils/Stores/List';

import { removeAllCategoriesFromProduct } from '@functions/Category/Products';
import { getProductTeam } from '@functions/Product/Team';
import { getProduct } from '@functions/Product';

import AppError from '@errors/AppError';
import { addToCategory } from './Category/AddToCategory';

interface updateProductProps {
    id: string;
    name?: string;
    code?: string;
    brand_id?: string;
    store_id?: string | null;
    category_id?: string;
}

async function updateProduct({
    id,
    name,
    code,
    brand_id,
    store_id,
    category_id,
}: updateProductProps): Promise<Product> {
    const productRepository = getRepository(Product);
    const product = await getProduct({ product_id: id });

    if (!product) {
        throw new AppError({
            message: 'Product was not found',
            statusCode: 400,
            internalErrorCode: 8,
        });
    }

    const cache = new Cache();

    const team = await getProductTeam(product);

    const brands = await getAllBrands({ team_id: team.id });
    const findedBrand = brands.find(b => b.id === brand_id);

    const stores = await getAllStoresFromTeam({ team_id: team.id });
    const findedStore = stores.find(store => store.id === store_id);

    if (name) product.name = name;
    if (code) product.code = code;
    product.store = findedStore || null;

    if (product.categories.length > 0) {
        await cache.invalidade(
            `products-from-category:${product.categories[0].category.id}`,
        );
    }

    // This invalidade the old brand products and the new one
    if (product.brand)
        await cache.invalidade(`products-from-brand:${product.brand.id}`);
    // This update brand cache only if its have an update value
    if (findedBrand) {
        await cache.invalidade(`products-from-brand:${findedBrand.id}`);
    }
    if (product.store) {
        await cache.invalidade(`products-from-store:${product.store.id}`);
    }

    product.brand = findedBrand || null;

    const updatedProduct = await productRepository.save(product);

    if (category_id) {
        await removeAllCategoriesFromProduct({
            product_id: updatedProduct.id,
        });

        const categoryRepository = getRepository(Category);
        const category = await categoryRepository.findOne({
            where: {
                id: category_id,
            },
        });

        if (!category) {
            throw new AppError({
                message: 'Category was not found',
                statusCode: 400,
                internalErrorCode: 10,
            });
        }

        await addToCategory({
            product_id: updatedProduct.id,
            category_id: category.id,
        });

        await cache.invalidade(`products-from-category:${category.id}`);
    }

    await cache.invalidade(`products-from-teams:${team.id}`);
    await cache.invalidade(`product:${team.id}:${updatedProduct.id}`);

    return updatedProduct;
}

export { updateProduct };
