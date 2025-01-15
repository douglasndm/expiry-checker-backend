import { defaultDataSource } from '@services/TypeORM';

import UserStores from '@models/UsersStores';

async function getUserStore(user_id: string): Promise<IStore | null> {
    const userStoresRepository = defaultDataSource.getRepository(UserStores);
    const userStores = await userStoresRepository
        .createQueryBuilder('userStores')
        .leftJoinAndSelect('userStores.user', 'user')
        .leftJoinAndSelect('userStores.store', 'store')
        .leftJoinAndSelect('store.team', 'team')
        .select([
            'userStores',
            'store.id',
            'store.name',
            'team.id',
            'team.name',
        ])
        .where('user.id = :user_id', { user_id })
        .getOne();

    if (!userStores) return null;

    return {
        id: userStores.store.id,
        name: userStores.store.name,
    };
}

export { getUserStore };
