import { getRepository } from 'typeorm';
import { addDays } from 'date-fns';

import Team from '@models/Team';
import Batch from '@models/Batch';

interface getAllTeamsExpiredProductsResponse {
    id: string;
    name: string;
    products: {
        id: string;
        name: string;
        expired_batches: Batch[];
        nextToExp_batches: Batch[];
    }[];
}

export async function getAllTeamsExpiredProducts(): Promise<
    getAllTeamsExpiredProductsResponse[]
> {
    const teamRepository = getRepository(Team);

    const teamsData = await teamRepository
        .createQueryBuilder('team')
        .leftJoinAndSelect('team.products', 'productTeams')
        .leftJoinAndSelect('productTeams.product', 'product')
        .leftJoinAndSelect('product.batches', 'batches')
        .where('batches.status != :status', { status: 'checked' })
        .andWhere(`batches.exp_date <= :date`, {
            date: addDays(new Date(), 30), // THIS SELECT EXPIRED PRODUCTS AND PRODUCTS THAT WILL EXPIRE SOON
        })
        .getMany();

    const teamsWithProducts = teamsData.filter(
        team => team.products.length > 0,
    );

    const teams = teamsWithProducts.map(team => {
        const products = team.products.map(prod => {
            const expiredBatches = prod.product.batches.filter(
                batch => batch.exp_date <= new Date(),
            );
            const nextBatches = prod.product.batches.filter(
                batch => batch.exp_date > new Date(),
            );

            return {
                id: prod.product.id,
                name: prod.product.name,
                expired_batches: expiredBatches,
                nextToExp_batches: nextBatches,
            };
        });

        return {
            id: team.id,
            name: team.name,
            products,
        };
    });

    return teams;
}
