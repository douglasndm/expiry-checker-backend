import { getRepository } from 'typeorm';

import ProductTeams from '@models/ProductTeams';
import Product from '@models/Product';

interface getAllProductsProps {
    team_id: string;
}

export async function getAllProducts({
    team_id,
}: getAllProductsProps): Promise<ProductTeams[]> {
    const productTeamsRepo = getRepository(ProductTeams);

    const products = await productTeamsRepo
        .createQueryBuilder('prods')
        .leftJoinAndSelect('prods.batches', 'batches')
        .leftJoinAndSelect('prods.team', 'team')
        .where('team.id = :team_id', { team_id })
        .getMany();

    return products;
}

interface getAllProductsFromManyTeams {
    teams: string[];
}

export async function getAllProductsFromManyTeams({
    teams,
}: getAllProductsFromManyTeams): Promise<ProductTeams[]> {
    const productTeamsRepo = getRepository(ProductTeams);

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
