import { defaultDataSource } from '@services/TypeORM';

import Product from '@models/Product';
import Team from '@models/Team';

import AppError from '@errors/AppError';

export async function getProductTeam(product: Product): Promise<Team> {
    const productTeamRepository = defaultDataSource.getRepository(Product);

    const prodTeam = await productTeamRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.team', 'team')
        .where('product.id = :product_id', { product_id: product.id })
        .getOne();

    if (!prodTeam) {
        throw new AppError({
            message: 'Product was not found in team',
            statusCode: 400,
        });
    }

    return prodTeam.team;
}
