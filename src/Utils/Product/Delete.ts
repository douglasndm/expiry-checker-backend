import { getRepository } from 'typeorm';

import Product from '@models/Product';

import Cache from '@services/Cache';

import { getProductById } from './Get';

interface deleteProductProps {
    product_id: string;
}

async function deleteProduct(props: deleteProductProps): Promise<void> {
    const product = await getProductById({
        product_id: props.product_id,
        includeBrand: true,
        includeCategory: true,
        includeStore: true,
    });

    const cache = new Cache();

    if (product.brand) {
        await cache.invalidade(`products-from-brand:${product.brand.id}`);
    }
    if (product.category) {
        await cache.invalidade(
            `products-from-category:${product.category.category.id}`,
        );
    }
    if (product.store) {
        await cache.invalidade(`products-from-store:${product.store.id}`);
    }

    await cache.invalidade(`products-from-teams:${product.team.team.id}`);
    await cache.invalidade(`product:${product.team.team.id}:${product.id}`);

    const productRepository = getRepository(Product);
    await productRepository.remove(product);
}

export { deleteProduct };
