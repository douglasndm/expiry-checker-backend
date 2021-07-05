import { getRepository } from 'typeorm';

import AppError from '@errors/AppError';

import Team from '@models/Team';
import ProductTeam from '@models/ProductTeams';

import { checkIfUserHasAccessToTeam } from './Security/UserAccessTeam';

interface checkIfUserHasAccessToAProductProps {
    product_id: string;
    user_id: string;
}

interface checkIfUserHasAccessToAProductResponse {
    team?: Team;
    hasAccess: boolean;
}

export async function checkIfUserHasAccessToAProduct({
    user_id,
    product_id,
}: checkIfUserHasAccessToAProductProps): Promise<checkIfUserHasAccessToAProductResponse> {
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

    const userHasAccess = await checkIfUserHasAccessToTeam({
        user_id,
        team_id: productTeam.team.id,
    });

    if (userHasAccess) {
        return {
            team: productTeam.team,
            hasAccess: true,
        };
    }

    return {
        hasAccess: false,
    };
}
