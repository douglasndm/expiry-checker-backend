import { getRepository } from 'typeorm';

import UserRoles from '@models/UserRoles';

import Cache from '@services/Cache';

interface checkIfUserHasAccessToTeamProps {
    user_id: string;
    team_id: string;
}
export async function checkIfUserHasAccessToTeam({
    user_id,
    team_id,
}: checkIfUserHasAccessToTeamProps): Promise<boolean> {
    const cache = new Cache();

    const cachedUsers = await cache.get<Array<UserRoles>>(
        `users-from-teams:${team_id}`,
    );

    let user;

    if (cachedUsers) {
        user = cachedUsers.find(u => u.user.firebaseUid === user_id);
    } else {
        const userRolesRepository = getRepository(UserRoles);

        user = await userRolesRepository.findOne({
            where: {
                user: {
                    firebaseUid: user_id,
                },
                team: {
                    id: team_id,
                },
            },
        });
    }

    if (!user || (!!user && user.status === 'Pending')) {
        return false;
    }

    return true;
}
