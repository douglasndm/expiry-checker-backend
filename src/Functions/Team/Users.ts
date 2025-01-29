import { defaultDataSource } from '@services/TypeORM';

import { getFromCache, saveOnCache } from '@services/Cache/Redis';

import UserTeam from '@models/UserTeam';
import Store from '@models/Store';

interface getAllUsersFromTeamProps {
    team_id: string;
}

export interface UserResponse {
    uuid: string;
    id: string;
    fid?: string;
    name?: string;
    lastName?: string;
    email: string;
    role: string;
    status: string;
    device?: string | null;
    store: Store | null;
}

export async function getAllUsersFromTeam({
    team_id,
}: getAllUsersFromTeamProps): Promise<UserResponse[]> {
    const cachedUsers = await getFromCache<UserTeam[]>(`team_users:${team_id}`);

    let usersFromTeam: Array<UserTeam> = [];

    if (cachedUsers) {
        usersFromTeam = cachedUsers;
    } else {
        const userTeamsRepository = defaultDataSource.getRepository(UserTeam);

        const usersTeam = await userTeamsRepository
            .createQueryBuilder('usersTeam')
            .leftJoinAndSelect('usersTeam.user', 'user')
            .leftJoinAndSelect('usersTeam.team', 'team')
            .leftJoinAndSelect('user.store', 'userStores')
            .leftJoinAndSelect('userStores.store', 'store')
            .where('team.id = :team_id', { team_id })
            .getMany();

        await saveOnCache(`team_users:${team_id}`, usersTeam);

        usersFromTeam = usersTeam;
    }

    const users: Array<UserResponse> = usersFromTeam.map(u => {
        return {
            uuid: u.user.id,
            id: u.user.id,

            fid: u.user.firebaseUid,

            name: u.user.name,
            lastName: u.user.lastName,
            email: u.user.email,
            role: u.role,
            status: u.status,
            code: u.code,
            store: u.user.store?.store,
        };
    });

    return users;
}
