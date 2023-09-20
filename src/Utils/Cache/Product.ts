import Cache from '@services/Cache';

import { getProductById } from '@utils/Product/Get';

async function clearProductCache(product_id: string): Promise<void> {
    const product = await getProductById({
        product_id,
        includeBrand: true,
        includeCategory: true,
        includeStore: true,
    });

    const { team } = product.team;

    const cache = new Cache();
    await cache.invalidade(`team_products:${team.id}`);
    await cache.invalidade(`product:${team.id}:${product.id}`);

    if (product.brand) {
        await cache.invalidade(`brand_products:${team.id}:${product.brand.id}`);
    }

    if (product.category) {
        await cache.invalidade(
            `category_products:${team.id}:${product.category.category.id}`,
        );
    }
    if (product.store) {
        await cache.invalidade(`store_products:${team.id}:${product.store.id}`);
    }
}

export { clearProductCache };
