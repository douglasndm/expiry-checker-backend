import { getRepository } from 'typeorm';

import UserRoles from '../../App/Models/UserRoles';

interface getUserRoleProps {
    user_id: string;
    team_id: string;
    useInternalId?: boolean;
}

export async function isUserManager({
    user_id,
    team_id,
    useInternalId,
}: getUserRoleProps): Promise<boolean> {
    const userRolesRepository = getRepository(UserRoles);

    let userRole: UserRoles | null;

    if (useInternalId) {
        userRole = await userRolesRepository
            .createQueryBuilder('role')
            .leftJoinAndSelect('role.user', 'user')
            .leftJoinAndSelect('role.team', 'team')
            .where('user.id = :user_id', { user_id })
            .andWhere('team.id = :team_id', { team_id })
            .getOne();
    } else {
        userRole = await userRolesRepository.findOne({
            where: {
                user: { firebaseUid: user_id },
                team: { id: team_id },
            },
        });
    }

    if (!userRole || (userRole && userRole.role.toLowerCase() !== 'manager')) {
        return false;
    }

    return true;
}
