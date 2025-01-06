import { addDays, compareAsc, startOfDay } from 'date-fns';

import { defaultDataSource } from '@services/TypeORM';

import Team from '@models/Team';
import Batch from '@models/Batch';

interface getAllTeamsExpiredProductsResponse {
    id: string;
    name: string;
    products: {
        id: string;
        name: string;
        store_id?: string;
        expired_batches: Batch[];
        nextToExp_batches: Batch[];
    }[];
}

export async function getAllTeamsExpiredProducts(): Promise<
    getAllTeamsExpiredProductsResponse[]
> {
    const teamRepository = defaultDataSource.getRepository(Team);

    const teamsData = await teamRepository
        .createQueryBuilder('team')
        .leftJoinAndSelect('team.products', 'product')
        .leftJoinAndSelect('product.batches', 'batches')
        .leftJoinAndSelect('product.store', 'store')
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
            const { batches } = prod;

            const today = startOfDay(new Date());

            const expiredBatches = batches.filter(batch => {
                const batchDate = startOfDay(batch.exp_date);

                if (compareAsc(batchDate, today) < 0) {
                    return true;
                }
                return false;
            });

            const nextBatches = batches.filter(batch => {
                const batchDate = startOfDay(batch.exp_date);

                if (compareAsc(batchDate, today) >= 0) {
                    return true;
                }
                return false;
            });

            return {
                id: prod.id,
                name: prod.name,
                store_id: prod.store?.id,
                expired_batches: expiredBatches,
                nextToExp_batches: nextBatches,
            };
        });

        return {
            id: team.id,
            name: team.name || '',
            products,
        };
    });

    return teams;
}
