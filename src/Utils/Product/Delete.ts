import { getRepository } from 'typeorm';

import Product from '@models/Product';

import Cache from '@services/Cache';
import { removeProductImageFromS3 } from '@services/AWS';

import { clearProductCache } from '@utils/Cache/Product';
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

    await clearProductCache(product.id);

    const { team } = product.team;
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
