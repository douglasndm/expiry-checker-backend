import { defaultDataSource } from '@services/TypeORM';

import Team from '@models/Team';
import Product from '@models/Product';

import { getUserRole } from '@utils/Team/Roles/Find';

import AppError from '@errors/AppError';

interface checkIfUserHasAccessToAProductProps {
    product_id: string;
    user_id: string;
}

export async function checkIfUserHasAccessToAProduct({
    user_id,
    product_id,
}: checkIfUserHasAccessToAProductProps): Promise<Team> {
    const productRepository = defaultDataSource.getRepository(Product);

    const productTeam = await productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.team', 'team')
        .where('product.id = :id', { id: product_id })
        .getOne();

    if (!productTeam) {
        throw new AppError({
            message: 'Product and Team relatioship was not found',
            statusCode: 400,
        });
    }
    // This will throw an error if user isn't on team
    await getUserRole({ user_id, team_id: productTeam.team.id });

    return productTeam.team;
}
