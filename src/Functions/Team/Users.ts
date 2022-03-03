import { getRepository } from 'typeorm';

import UserRoles from '@models/UserRoles';
import UserDevice from '@models/UserDevice';
import Store from '@models/Store';

import Cache from '@services/Cache';

interface getAllUsersFromTeamProps {
    team_id: string;
    includeDevices?: boolean;
}

export interface UserResponse {
    uuid: string;
    id: string;
    fid?: string;
    email: string;
    role: string;
    status: string;
    device?: string | null;
}

export async function getAllUsersFromTeam({
    team_id,
    includeDevices,
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
            .where('team.id = :team_id', { team_id })
            .getMany();

        await cache.save(`users-from-teams:${team_id}`, usersTeam);

        usersFromTeam = usersTeam;
    }

    let devices: Array<UserDevice> = [];

    if (includeDevices) {
        const devicesRepo = getRepository(UserDevice);

        const usersIds = usersFromTeam.map(user => user.user.firebaseUid);

        const usersDevices = await devicesRepo
            .createQueryBuilder('device')
            .leftJoinAndSelect('device.user', 'user')
            .where('device.user IN(:...usersIds)', { usersIds })
            .getMany();

        devices = usersDevices;
    }

    const users: Array<UserResponse> = usersFromTeam.map(u => {
        const { firebaseUid } = u.user;

        let userDevice: string | null = null;

        if (includeDevices) {
            const device = devices.find(
                d => d.user.firebaseUid === firebaseUid,
            );

            if (device) {
                userDevice = device.device_id;
            } else {
                userDevice = null;
            }
        }

        const stores: Store[] = [];

        if (u.user.stores && u.user.stores.length > 0) {
            u.user.stores.forEach(store => {
                stores.push(store.store);
            });
        }

        return {
            uuid: u.user.id,
            id: firebaseUid,
            fid: firebaseUid,
            email: u.user.email,
            role: u.role,
            stores,
            status: u.status,
            code: u.code,
            device: userDevice,
        };
    });

    return users;
}
