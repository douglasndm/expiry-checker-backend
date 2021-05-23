import { getRepository } from 'typeorm';

import UserTeam from '../App/Models/UserRoles';
import ProductTeam from '../App/Models/ProductTeams';
import { checkIfTeamIsActive } from './Team';

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

    const productTeam = await productTeamRepository.findOne({
        where: {
            product: {
                id: product_id,
            },
        },
        relations: ['team'],
    });

    if (productTeam && productTeam.team.id) {
        const teamSubscription = await checkIfTeamIsActive({
            team_id: productTeam.team.id,
        });

        if (!teamSubscription) {
            throw new Error("Team doesn't have an active subscription");
        }
    }

    const hasAccessToProduct = userTeams.filter(
        userTeam => userTeam.team.id === productTeam?.team.id,
    );

    if (hasAccessToProduct.length > 0) {
        return true;
    }
    return false;
}
