import { defaultDataSource } from '@services/TypeORM';

import { invalidadeTeamCache } from '@services/Cache/Redis';

import Product from '@models/Product';

import { getTeamById } from '@utils/Team/Find';

interface createManyProductsProps {
    products: Product[];
    team_id: string;
}

async function createManyProducts({
    products,
    team_id,
}: createManyProductsProps): Promise<Product[]> {
    const team = await getTeamById(team_id);

    const productsTeams = products.map(product => {
        return {
            ...product,
            team,
        };
    });

    const repository = defaultDataSource.getRepository(Product);
    const createdProductsTeams = await repository.save(productsTeams);

    await invalidadeTeamCache(team_id);

    return createdProductsTeams;
}

export { createManyProducts };
