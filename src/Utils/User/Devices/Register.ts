import { defaultDataSource } from '@services/TypeORM';

import { invalidadeCache } from '@services/Cache/Redis';

import { getUserById } from '@utils/User/Find';

import UserLogin from '@models/UserLogin';

import AppError from '@errors/AppError';

async function registerDevice({
    user_id,
    device_id,
    ip_address,
    firebaseToken,
}: registerDeviceProps): Promise<UserLogin> {
    if (!firebaseToken) {
        throw new AppError({
            message: 'Firebase Messaging Token is required',
            statusCode: 401,
        });
    }

    const repository = defaultDataSource.getRepository(UserLogin);

    const prevLogin = await repository
        .createQueryBuilder('login')
        .leftJoinAndSelect('login.user', 'user')
        .where('user.id = :user_id', { user_id })
        .orWhere('login.firebaseMessagingToken = :firebaseToken', {
            firebaseToken,
        })
        .getMany();

    if (prevLogin.length > 0) {
        await repository.remove(prevLogin);
    }

    const user = await getUserById(user_id);

    const userLogin = new UserLogin();
    userLogin.deviceId = device_id;
    userLogin.user = user;
    userLogin.ipAddress = ip_address;
    userLogin.firebaseMessagingToken =
        firebaseToken === '' ? undefined : firebaseToken;

    const savedUserLogin = await repository.save(userLogin);

    await invalidadeCache('users_devices');

    return savedUserLogin;
}

export { registerDevice };
