import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import { checkIfUserIsOnTeam } from '@utils/Team/Users';

import User from '@models/User';
import Store from '@models/Store';
import UserStores from '@models/UsersStores';

import AppError from '@errors/AppError';

async function getAllUsersFromStore({
    store_id,
}: getAllUsersFromStoreProps): Promise<getAllUsersFromStoreResponse[]> {
    const schema = Yup.object().shape({
        store_id: Yup.string().uuid().required(),
    });

    try {
        await schema.validate({ store_id });
    } catch (err) {
        throw new AppError({
            message: 'Check the store id',
            internalErrorCode: 1,
        });
    }

    const userRepository = getRepository(User);

    const users = await userRepository
        .createQueryBuilder('users')
        .leftJoinAndSelect('users.stores', 'usersStores')
        .leftJoinAndSelect('usersStores.store', 'store')
        .where('store.id = :store_id', { store_id })
        .getMany();

    const usersWithFixedStores = users.map(user => ({
        ...user,
        stores: user.stores.map(userStores => userStores.store),
    }));

    return usersWithFixedStores;
}

async function getAllStoresFromUser({
    user_id,
}: getAllStoresFromUserProps): Promise<getAllStoresFromUserResponse[]> {
    const schema = Yup.object().shape({
        user_id: Yup.string().uuid().required(),
    });

    try {
        await schema.validate({ user_id });
    } catch (err) {
        throw new AppError({
            message: 'Check the user id',
            internalErrorCode: 1,
        });
    }

    const userStoresRepository = getRepository(UserStores);
    const userStores = await userStoresRepository
        .createQueryBuilder('userStores')
        .leftJoinAndSelect('userStores.user', 'user')
        .leftJoinAndSelect('userStores.store', 'store')
        .leftJoinAndSelect('store.team', 'team')
        .where('user.id = :user_id', { user_id })
        .getMany();

    const stores: getAllStoresFromUserResponse[] = userStores.map(
        userStore => ({
            store: userStore.store,
            team_id: userStore.store.team.id,
        }),
    );

    return stores;
}

async function addUserToStore({
    user_id,
    store_id,
}: addUserToStoreProps): Promise<void> {
    const schema = Yup.object().shape({
        user_id: Yup.string().uuid().required(),
        store_id: Yup.string().uuid().required(),
    });

    try {
        await schema.validate({ store_id, user_id });
    } catch (err) {
        throw new AppError({
            message: 'Check the user/store id',
            internalErrorCode: 1,
        });
    }

    const userRepository = getRepository(User);
    const storeRepository = getRepository(Store);
    const userStoresRepository = getRepository(UserStores);

    const alreadyHaveStore = await userStoresRepository
        .createQueryBuilder('userStore')
        .leftJoinAndSelect('userStore.store', 'store')
        .leftJoinAndSelect('userStore.user', 'user')
        .where('user.id = :user_id', { user_id })
        .getMany();

    if (alreadyHaveStore) {
        await userStoresRepository.remove(alreadyHaveStore);
    }

    const user = await userRepository.findOne({ where: { id: user_id } });
    const store = await storeRepository
        .createQueryBuilder('store')
        .leftJoinAndSelect('store.team', 'team')
        .where('store.id = :store_id', { store_id })
        .getOne();

    if (!user) {
        throw new AppError({
            message: 'User not found',
            internalErrorCode: 7,
        });
    }

    if (!store) {
        throw new AppError({
            message: 'Store not found',
            internalErrorCode: 37,
        });
    }

    const onTeam = await checkIfUserIsOnTeam({
        user_id: user.id,
        team_id: store.team.id,
    });

    if (!onTeam) {
        throw new AppError({
            message: 'User is not on team, so you can not add it on a store',
            internalErrorCode: 38,
        });
    }

    const userStore = new UserStores();
    userStore.user = user;
    userStore.store = store;

    await userStoresRepository.save(userStore);
}

async function removeUserFromStore({
    user_id,
    store_id,
}: removeUserFromStoreProps): Promise<void> {
    const schema = Yup.object().shape({
        user_id: Yup.string().uuid().required(),
        store_id: Yup.string().uuid().required(),
    });

    try {
        await schema.validate({ store_id, user_id });
    } catch (err) {
        throw new AppError({
            message: 'Check the user/store id',
            internalErrorCode: 1,
        });
    }

    const userStoresRepository = getRepository(UserStores);

    const userStore = await userStoresRepository
        .createQueryBuilder('userStore')
        .leftJoinAndSelect('userStore.user', 'user')
        .leftJoinAndSelect('userStore.store', 'store')
        .where('user.id = :user_id', { user_id })
        .andWhere('store.id = :store_id', { store_id })
        .getOne();

    if (!userStore) {
        throw new AppError({
            message: 'User is not in store',
            internalErrorCode: 39,
        });
    }

    await userStoresRepository.remove(userStore);
}

export {
    getAllUsersFromStore,
    getAllStoresFromUser,
    addUserToStore,
    removeUserFromStore,
};
