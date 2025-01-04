import { defaultDataSource } from '@services/TypeORM';

import Product from '@models/Product';

interface getAllProductsFromManyTeams {
    teams: string[];
}

export async function getAllProductsFromManyTeams({
    teams,
}: getAllProductsFromManyTeams): Promise<Product[]> {
    const productTeamsRepo = defaultDataSource.getRepository(Product);

    const products = await productTeamsRepo
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.store', 'store')
        .leftJoinAndSelect('product.batches', 'batches')
        .leftJoinAndSelect('product.team', 'team')
        .where('team.id IN (:...teamsIds)', { teamsIds: teams })
        .orderBy('batches.exp_date', 'ASC')
        .getMany();

    return products;
}
