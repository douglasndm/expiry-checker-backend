import { getRepository } from 'typeorm';

import UserRoles from '../../App/Models/UserRoles';

interface isUserManagerProps {
    user_id: string;
    team_id: string;
}

export async function isUserManager({
    user_id,
    team_id,
}: isUserManagerProps): Promise<boolean> {
    const userRolesRepository = getRepository(UserRoles);
    const userRole = await userRolesRepository.findOne({
        where: {
            user: { firebaseUid: user_id },
            team: { id: team_id },
        },
    });

    if (!userRole || (userRole && userRole.role.toLowerCase() !== 'manager')) {
        return false;
    }

    return true;
}
