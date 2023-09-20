import { getRepository } from 'typeorm';

import Cache from '@services/Cache';

import Product from '@models/Product';

import { addToCategory } from '@utils/Product/Category/AddToCategory';
import { getProductById } from '@utils/Product/Get';
import { getAllBrands } from '@utils/Brand';
import { getAllStoresFromTeam } from '@utils/Stores/List';
import { removeCategoryFromProduct } from '@utils/Product/Category/Remove';
import { findCategoryById } from '@utils/Categories/Find';
import { clearProductCache } from '@utils/Cache/Product';

import { getProductTeam } from '@functions/Product/Team';

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
    const product = await getProductById({
        product_id: id,
        includeBrand: true,
        includeCategory: true,
        includeStore: true,
    });

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
    if (product.brand) {
        await cache.invalidade(`brand_products:${team.id}:${product.brand.id}`);
    }

    if (product.store) {
        await cache.invalidade(`store_products:${team.id}:${product.store.id}`);
    }
    product.brand = findedBrand || null;

    if (store_id === null || findedStore) {
        product.store = findedStore || null;
    }

    const updatedProduct = await productRepository.save(product);

    if (category_id !== undefined) {
        await removeCategoryFromProduct(updatedProduct.id);

        if (category_id) {
            const category = await findCategoryById(category_id);

            await addToCategory({
                product_id: updatedProduct.id,
                category_id: category.id,
            });
        }
    }

    await clearProductCache(updatedProduct.id);

    return updatedProduct;
}

export { updateProduct };
