import { getRepository } from 'typeorm';

import AppError from '@errors/AppError';

import UserTeam from '@models/UserRoles';
import ProductTeam from '@models/ProductTeams';

import { checkIfUserHasAccessToTeam } from './Security/UserAccessTeam';

interface checkIfUserHasAccessToAProductProps {
    product_id: string;
    user_id: string;
}

export async function checkIfUserHasAccessToAProduct({
    user_id,
    product_id,
}: checkIfUserHasAccessToAProductProps): Promise<boolean> {
    const userTeamRepository = getRepository(UserTeam);
    const productTeamRepository = getRepository(ProductTeam);

    const userTeams = await userTeamRepository.find({
        where: {
            user: {
                firebaseUid: user_id,
            },
        },
        relations: ['team'],
    });

    const productTeam = await productTeamRepository
        .createQueryBuilder('prodTeam')
        .leftJoinAndSelect('prodTeam.product', 'prod')
        .leftJoinAndSelect('prodTeam.team', 'team')
        .where('prod.id = :id', { id: product_id })
        .getOne();

    if (!productTeam) {
        throw new AppError('Product and Team relatioship was not found', 400);
    }

    const checkTeamAccess = await checkIfUserHasAccessToTeam({
        user_id,
        team_id: productTeam?.team.id,
    });

    if (!checkTeamAccess) {
        throw new AppError("User doesn't have access to the team", 401);
    }

    const hasAccessToProduct = userTeams.filter(
        userTeam => userTeam.team.id === productTeam?.team.id,
    );

    if (hasAccessToProduct.length > 0) {
        return true;
    }
    return false;
}
