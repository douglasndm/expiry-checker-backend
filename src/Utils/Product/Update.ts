import { defaultDataSource } from '@services/TypeORM';

import { invalidadeCache } from '@services/Cache/Redis';

import Product from '@models/Product';

import { getProductById } from '@utils/Product/Get';
import { getAllBrands } from '@utils/Brand';
import { getAllCategoriesFromTeam } from '@utils/Categories/List';
import { getAllStoresFromTeam } from '@utils/Stores/List';
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
    const productRepository = defaultDataSource.getRepository(Product);
    const product = await getProductById({
        product_id: id,
        includeBrand: true,
        includeCategory: true,
        includeStore: true,
    });

    const team = await getProductTeam(product);

    const brands = await getAllBrands({ team_id: team.id });
    const findedBrand = brands.find(b => b.id === brand_id);

    const categories = await getAllCategoriesFromTeam({ team_id: team.id });
    const findedCategory = categories.find(cat => cat.id === category_id);

    const stores = await getAllStoresFromTeam({ team_id: team.id });
    const findedStore = stores.find(store => store.id === store_id);

    if (name) product.name = name;
    if (code) product.code = code;
    // image or NULL is ok, undefined is not, and it should not update
    if (image || image === null) product.image = image;

    // This invalidade the old brand products and the new one
    if (product.brand) {
        await invalidadeCache(`brand_products:${team.id}:${product.brand.id}`);
    }

    if (product.category) {
        await invalidadeCache(
            `category_products:${team.id}:${product.category.id}`,
        );
    }

    if (product.store) {
        await invalidadeCache(`store_products:${team.id}:${product.store.id}`);
    }
    product.brand = findedBrand || null;

    if (category_id === null || findedCategory) {
        product.category = findedCategory || null;
    }

    if (store_id === null || findedStore) {
        product.store = findedStore || null;
    }

    const updatedProduct = await productRepository.save(product);

    await clearProductCache(updatedProduct.id);

    return updatedProduct;
}

export { updateProduct };
