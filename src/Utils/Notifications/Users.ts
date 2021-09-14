import { getRepository } from 'typeorm';

import UserDevice from '@models/UserDevice';

import Cache from '@services/Cache';

export async function getAllUsersDevices(): Promise<UserDevice[]> {
    const cache = new Cache();

    const cachedDevices = await cache.get<UserDevice[]>('users_devices');

    if (cachedDevices) {
        return cachedDevices;
    }

    const userDeviceRepo = getRepository(UserDevice);

    const devices = await userDeviceRepo
        .createQueryBuilder('devices')
        .leftJoinAndSelect('devices.user', 'user')
        .getMany();

    await cache.save('users_devices', devices);

    return devices;
}
