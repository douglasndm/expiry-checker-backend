import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import { checkIfUserIsOnTeam } from '@utils/Team/Users';

import User from '@models/User';
import Store from '@models/Store';
import UserStores from '@models/UsersStores';

import AppError from '@errors/AppError';

interface getAllUsersFromStoreProps {
    store_id: string;
}

async function getAllUsersFromStore({
    store_id,
}: getAllUsersFromStoreProps): Promise<User[]> {
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

    const users = userRepository
        .createQueryBuilder('users')
        .leftJoinAndSelect('users.stores', 'store')
        .where('store.store_id = :store_id', { store_id })
        .getMany();

    return users;
}

interface addUserToStoreProps {
    user_id: string;
    store_id: string;
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

    const alreadyInStore = await userStoresRepository
        .createQueryBuilder('userStore')
        .leftJoinAndSelect('userStore.store', 'store')
        .leftJoinAndSelect('userStore.user', 'user')
        .where('user.id = :user_id', { user_id })
        .andWhere('store.id = :store_id', { store_id })
        .getOne();

    if (alreadyInStore) {
        throw new AppError({
            message: 'User is already in store',
            internalErrorCode: 36,
        });
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
        user_id: user.firebaseUid, // temp
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

export { getAllUsersFromStore, addUserToStore };
