import { getRepository } from 'typeorm';

import User from '@models/User';
import UserDevice from '@models/UserDevice';

interface getUserDeviceIdProps {
    user_id: string;
}

export async function getUserDeviceId({
    user_id,
}: getUserDeviceIdProps): Promise<string | null> {
    const deviceRepository = getRepository(UserDevice);

    const device = await deviceRepository
        .createQueryBuilder('device')
        .leftJoinAndSelect('device.user', 'user')
        .where('user.firebaseUid = :user_id', { user_id })
        .getOne();

    if (!device) {
        return null;
    }

    return device.device_id;
}

interface addUserDeviceProps {
    user_id: string;
    device_id: string;
}

export async function addUserDevice({
    user_id,
    device_id,
}: addUserDeviceProps): Promise<void> {
    const userRepository = getRepository(User);
    const deviceRepository = getRepository(UserDevice);

    const user = await userRepository.findOne({
        where: {
            firebaseUid: user_id,
        },
    });

    if (!user) {
        throw new Error('User not found');
    }

    const deviceExist = await deviceRepository
        .createQueryBuilder('device')
        .leftJoinAndSelect('device.user', 'user')
        .where('user.firebaseUid = :user_id', { user_id })
        .getOne();

    if (deviceExist) {
        await deviceRepository.remove(deviceExist);
    }

    const device = new UserDevice();
    device.user = user;
    device.device_id = device_id;

    await deviceRepository.save(device);
}
