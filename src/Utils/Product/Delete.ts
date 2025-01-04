import { defaultDataSource } from '@services/TypeORM';

import { removeProductImageFromS3 } from '@services/AWS';
import { invalidadeTeamCache } from '@services/Cache/Redis';

import Product from '@models/Product';

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

    const productRepository = defaultDataSource.getRepository(Product);
    await productRepository.remove(product);
}

async function deleteAllProductsFromTeam(team_id: string): Promise<void> {
    const productRepository = defaultDataSource.getRepository(Product);

    const products = await productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.team', 'prodTeam')
        .leftJoinAndSelect('prodTeam.team', 'team')
        .where('team.id = :team_id', { team_id })
        .getMany();

    await productRepository.remove(products);

    await invalidadeTeamCache(team_id);
}

export { deleteProduct, deleteAllProductsFromTeam };
