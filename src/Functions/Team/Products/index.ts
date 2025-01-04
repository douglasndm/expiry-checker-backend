import { defaultDataSource } from '@services/TypeORM';

import ProductTeams from '@models/ProductTeams';

interface getAllProductsFromManyTeams {
    teams: string[];
}

export async function getAllProductsFromManyTeams({
    teams,
}: getAllProductsFromManyTeams): Promise<ProductTeams[]> {
    const productTeamsRepo = defaultDataSource.getRepository(ProductTeams);

    const products = await productTeamsRepo
        .createQueryBuilder('prods')
        .leftJoinAndSelect('prods.product', 'product')
        .leftJoinAndSelect('product.store', 'store')
        .leftJoinAndSelect('product.batches', 'batches')
        .leftJoinAndSelect('prods.team', 'team')
        .where('team.id IN (:...teamsIds)', { teamsIds: teams })
        .orderBy('batches.exp_date', 'ASC')
        .getMany();

    return products;
}
