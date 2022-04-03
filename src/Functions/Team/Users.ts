import { getRepository } from 'typeorm';

import UserRoles from '@models/UserRoles';
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
}

export async function getAllUsersFromTeam({
    team_id,
}: getAllUsersFromTeamProps): Promise<UserResponse[]> {
    const cache = new Cache();

    const cachedUsers = await cache.get<Array<UserRoles>>(
        `users-from-teams:${team_id}`,
    );

    let usersFromTeam: Array<UserRoles> = [];

    if (cachedUsers) {
        usersFromTeam = cachedUsers;
    } else {
        const userTeamsRepository = getRepository(UserRoles);

        const usersTeam = await userTeamsRepository
            .createQueryBuilder('usersTeam')
            .leftJoinAndSelect('usersTeam.user', 'user')
            .leftJoinAndSelect('usersTeam.team', 'team')
            .leftJoinAndSelect('user.stores', 'userStores')
            .leftJoinAndSelect('userStores.store', 'store')
            .leftJoinAndSelect('userStores.user', 'uStore')
            .where('team.id = :team_id', { team_id })
            .getMany();

        await cache.save(`users-from-teams:${team_id}`, usersTeam);

        usersFromTeam = usersTeam;
    }

    const users: Array<UserResponse> = usersFromTeam.map(u => {
        const stores: Store[] = [];

        if (u.user.stores && u.user.stores.length > 0) {
            u.user.stores.forEach(store => {
                if (store.user.id === u.user.id) stores.push(store.store);
            });
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
        };
    });

    return users;
}
