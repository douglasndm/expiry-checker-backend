import { getRepository } from 'typeorm';

import Product from '@models/Product';

import Cache from '@services/Cache';
import { removeProductImageFromS3 } from '@services/AWS';

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

    const { team } = product.team;

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

    await cache.invalidade(`team_products:${team.id}`);
    await cache.invalidade(`product:${team.id}:${product.id}`);

    if (product.image) {
        removeProductImageFromS3({
            fileName: product.image,
            team_id: team.id,
        });
    }

    const productRepository = getRepository(Product);
    await productRepository.remove(product);
}

async function deleteAllProductsFromTeam(team_id: string): Promise<void> {
    const productRepository = getRepository(Product);

    const products = await productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.team', 'prodTeam')
        .leftJoinAndSelect('prodTeam.team', 'team')
        .where('team.id = :team_id', { team_id })
        .getMany();

    await productRepository.remove(products);

    const cache = new Cache();
    await cache.invalidadeTeamCache(team_id);
}

export { deleteProduct, deleteAllProductsFromTeam };
