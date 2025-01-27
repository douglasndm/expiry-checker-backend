import { defaultDataSource } from '@services/TypeORM';

import { invalidadeCache } from '@services/Cache/Redis';

import UserLogin from '@models/UserLogin';

import { getUserById } from '@utils/User/Find';

async function getAllLoginsFromAllUsers(): Promise<UserLogin[]> {
    const loginRepository = defaultDataSource.getRepository(UserLogin);

    const logins = await loginRepository
        .createQueryBuilder('login')
        .leftJoinAndSelect('login.user', 'user')
        .getMany();

    return logins;
}

async function getUserDevice({
    user_id,
}: getUserDeviceProps): Promise<UserLogin | null> {
    const loginRepository = defaultDataSource.getRepository(UserLogin);
    const login = await loginRepository
        .createQueryBuilder('login')
        .leftJoinAndSelect('login.user', 'user')
        .where('user.id = :user_id', { user_id })
        .getOne();

    return login || null;
}

async function registerDevice({
    user_id,
    device_id,
    ip_address,
    firebaseToken,
}: registerDeviceProps): Promise<UserLogin> {
    const userLoginRepository = defaultDataSource.getRepository(UserLogin);

    const prevLogin = await userLoginRepository
        .createQueryBuilder('login')
        .leftJoinAndSelect('login.user', 'user')
        .where('user.id = :user_id', { user_id })
        .orWhere('login.firebaseMessagingToken = :firebaseToken', {
            firebaseToken,
        })
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

    const savedUserLogin = await userLoginRepository.save(userLogin);

    await invalidadeCache('users_logins');

    return savedUserLogin;
}

export { getUserDevice, registerDevice, getAllLoginsFromAllUsers };
