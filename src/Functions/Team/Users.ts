import { getRepository } from 'typeorm';

import UserTeam from '@models/UserTeam';
import Store from '@models/Store';

import Cache from '@services/Cache';

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
    const cache = new Cache();

    const cachedUsers = await cache.get<Array<UserTeam>>(
        `team_users:${team_id}`,
    );

    let usersFromTeam: Array<UserTeam> = [];

    if (cachedUsers) {
        usersFromTeam = cachedUsers;
    } else {
        const userTeamsRepository = getRepository(UserTeam);

        const usersTeam = await userTeamsRepository
            .createQueryBuilder('usersTeam')
            .leftJoinAndSelect('usersTeam.user', 'user')
            .leftJoinAndSelect('usersTeam.team', 'team')
            .leftJoinAndSelect('user.store', 'userStores')
            .leftJoinAndSelect('userStores.store', 'store')
            .where('team.id = :team_id', { team_id })
            .getMany();

        await cache.save(`team_users:${team_id}`, usersTeam);

        usersFromTeam = usersTeam;
    }

    const users: Array<UserResponse> = usersFromTeam.map(u => {
        const stores: Store[] = [];

        if (u.user.store) {
            stores.push(u.user.store.store);
        }

        return {
            uuid: u.user.id,
            id: u.user.id,

            fid: u.user.firebaseUid,

            name: u.user.name,
            lastName: u.user.lastName,
            email: u.user.email,
            role: u.role,
            stores,
            status: u.status,
            code: u.code,
            store: u.user.store?.store,
        };
    });

    return users;
}
