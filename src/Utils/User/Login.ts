import { getRepository } from 'typeorm';

import Cache from '@services/Cache';

import UserLogin from '@models/UserLogin';

import { getUserById } from '@utils/User/Find';

async function getAllLoginsFromAllUsers(): Promise<UserLogin[]> {
    const loginRepository = getRepository(UserLogin);

    const logins = await loginRepository
        .createQueryBuilder('login')
        .leftJoinAndSelect('login.user', 'user')
        .getMany();

    return logins;
}

interface registerDeviceProps {
    user_id: string;
    device_id: string;
    ip_address?: string;
    firebaseToken?: string;
    oneSignalToken?: string;
}

async function registerDevice({
    user_id,
    device_id,
    ip_address,
    firebaseToken,
    oneSignalToken,
}: registerDeviceProps): Promise<UserLogin> {
    const userLoginRepository = getRepository(UserLogin);

    const prevLogin = await userLoginRepository
        .createQueryBuilder('login')
        .leftJoinAndSelect('login.user', 'user')
        .where('user.id = :user_id', { user_id })
        .getMany();

    if (prevLogin.length > 0) {
        await userLoginRepository.remove(prevLogin);
    }

    const user = await getUserById(user_id);

    const userLogin = new UserLogin();
    userLogin.deviceId = device_id;
    userLogin.user = user;
    userLogin.ipAddress = ip_address;
    userLogin.firebaseMessagingToken =
        firebaseToken === '' ? undefined : firebaseToken;
    userLogin.oneSignalToken = oneSignalToken;

    const savedUserLogin = await userLoginRepository.save(userLogin);

    const cache = new Cache();
    await cache.invalidade('users_logins');

    return savedUserLogin;
}

export { registerDevice, getAllLoginsFromAllUsers };
