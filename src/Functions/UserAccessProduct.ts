import { getRepository } from 'typeorm';

import Team from '@models/Team';
import ProductTeam from '@models/ProductTeams';

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
    const productTeamRepository = getRepository(ProductTeam);

    const productTeam = await productTeamRepository
        .createQueryBuilder('prodTeam')
        .leftJoinAndSelect('prodTeam.product', 'prod')
        .leftJoinAndSelect('prodTeam.team', 'team')
        .where('prod.id = :id', { id: product_id })
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
