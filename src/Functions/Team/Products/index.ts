import { getRepository } from 'typeorm';

import ProductTeams from '@models/ProductTeams';
import Product from '@models/Product';

interface deleteAllProductsProps {
    team_id: string;
}

export async function deleteAllProducts({
    team_id,
}: deleteAllProductsProps): Promise<void> {
    const productTeamsRepo = getRepository(ProductTeams);
    const productsRepo = getRepository(Product);

    const productsTeams = await productTeamsRepo
        .createQueryBuilder('prodTeam')
        .leftJoinAndSelect('prodTeam.product', 'product')
        .leftJoinAndSelect('prodTeam.team', 'team')
        .where('team.id = :team_id', { team_id })
        .getMany();

    const productsToDelete = productsTeams.map(pt => pt.product);

    await productsRepo.remove(productsToDelete);
}
