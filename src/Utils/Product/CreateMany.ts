import { defaultDataSource } from '@services/TypeORM';

import { invalidadeTeamCache } from '@services/Cache/Redis';

import Product from '@models/Product';
import ProductTeams from '@models/ProductTeams';

import { getTeamById } from '@utils/Team/Find';

interface createManyProductsProps {
    products: Product[];
    team_id: string;
}

async function createManyProducts({
    products,
    team_id,
}: createManyProductsProps): Promise<ProductTeams[]> {
    const team = await getTeamById(team_id);

    const productsTeams = products.map(product => {
        const productTeams = new ProductTeams();
        productTeams.product = product;
        productTeams.team = team;

        return productTeams;
    });

    const repository = defaultDataSource.getRepository(ProductTeams);
    const createdProductsTeams = await repository.save(productsTeams);

    await invalidadeTeamCache(team_id);

    return createdProductsTeams;
}

export { createManyProducts };
