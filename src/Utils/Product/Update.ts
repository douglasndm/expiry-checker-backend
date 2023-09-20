import { getRepository } from 'typeorm';

import Cache from '@services/Cache';

import Product from '@models/Product';

import { getAllBrands } from '@utils/Brand';
import { getAllStoresFromTeam } from '@utils/Stores/List';
import { removeCategoryFromProduct } from '@utils/Product/Category/Remove';

import { getProductTeam } from '@functions/Product/Team';
import { getProduct } from '@functions/Product';

import AppError from '@errors/AppError';
import { findCategoryById } from '@utils/Categories/Find';
import { addToCategory } from './Category/AddToCategory';

interface updateProductProps {
    id: string;
    name?: string;
    code?: string;
    image?: string | null;
    brand_id?: string | null;
    store_id?: string | null;
    category_id?: string | null;
}

async function updateProduct({
    id,
    name,
    code,
    image,
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
    // image or NULL is ok, undefined is not, and it should not update
    if (image || image === null) product.image = image;

    if (product.category) {
        await cache.invalidade(
            `category_products:${team.id}:${product.category.category.id}`,
        );
    }

    // This invalidade the old brand products and the new one
    if (product.brand)
        await cache.invalidade(`brand_products:${team.id}:${product.brand.id}`);
    // This update brand cache only if its have an update value
    if (findedBrand) {
        await cache.invalidade(`brand_products:${team.id}:${findedBrand.id}`);
    }

    if (product.store) {
        await cache.invalidade(`store_products:${team.id}:${product.store.id}`);
    }
    product.brand = findedBrand || null;

    if (store_id === null || findedStore) {
        product.store = findedStore || null;
    }

    const updatedProduct = await productRepository.save(product);

    if (category_id === null) {
        await removeCategoryFromProduct(updatedProduct.id);
    }

    if (category_id) {
        await removeCategoryFromProduct(updatedProduct.id);

        const category = await findCategoryById(category_id);

        await addToCategory({
            product_id: updatedProduct.id,
            category_id: category.id,
        });
    }

    await cache.invalidade(`team_products:${team.id}`);
    await cache.invalidade(`product:${team.id}:${updatedProduct.id}`);

    return updatedProduct;
}

export { updateProduct };
