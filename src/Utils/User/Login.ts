import { defaultDataSource } from '@services/TypeORM';

import UserLogin from '@models/UserLogin';

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

export { getUserDevice, getAllLoginsFromAllUsers };
