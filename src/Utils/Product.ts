import { defaultDataSource } from '@services/TypeORM';

import { invalidadeTeamCache } from '@services/Cache/Redis';

import { removeManyImages } from '@services/AWS';

import Product from '@models/Product';

export async function deleteManyProducts({
    productsIds,
    team_id,
}: deleteManyProductsProps): Promise<void> {
    const productRepository = defaultDataSource.getRepository(Product);

    // to do
    // remove images from s3
    const products = await productRepository
        .createQueryBuilder('product')
        .where('product.id IN (:...productsIds)', { productsIds })
        .getMany();

    const imagesToDelete: string[] = [];

    products.forEach(product => {
        if (product.image) {
            imagesToDelete.push(product.image);
        }
    });

    if (products.length > 0) {
        await productRepository.remove(products);
        removeManyImages(imagesToDelete, team_id);

        await invalidadeTeamCache(team_id);
    }
}
