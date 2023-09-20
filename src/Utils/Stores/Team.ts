import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import { getAllStoresFromUser } from '@utils/Stores/Users';

import AppError from '@errors/AppError';
import UserRoles from '@models/UserRoles';
import UserStores from '@models/UsersStores';

async function getUserStoreOnTeam({
    team_id,
    user_id,
}: getUserStoreOnTeamProps): Promise<getAllStoresFromUserResponse | undefined> {
    const schema = Yup.object().shape({
        team_id: Yup.string().uuid().required(),
        user_id: Yup.string().uuid().required(),
    });

    try {
        await schema.validate({ team_id, user_id });
    } catch (err) {
        throw new AppError({
            message: 'Check user/team id',
            internalErrorCode: 1,
        });
    }

    const userStores = await getAllStoresFromUser({ user_id });

    const store = userStores.find(sto => sto.team_id === team_id);

    return store;
}

async function removeUserFromAllStoresFromTeam({
    user_id,
    team_id,
}: removeUserFromAllStoresFromTeamProps): Promise<void> {
    const schema = Yup.object().shape({
        team_id: Yup.string().uuid().required(),
        user_id: Yup.string().uuid().required(),
    });

    try {
        await schema.validate({ team_id, user_id });
    } catch (err) {
        throw new AppError({
            message: 'Check user/team id',
            internalErrorCode: 1,
        });
    }

    const userRolesRepository = getRepository(UserRoles);
    const userRoles = await userRolesRepository
        .createQueryBuilder('userRoles')
        .leftJoinAndSelect('userRoles.user', 'user')
        .leftJoinAndSelect('userRoles.team', 'team')
        .leftJoinAndSelect('user.store', 'storesUser')
        .leftJoinAndSelect('storesUser.store', 'store')
        .leftJoinAndSelect('store.team', 'teamStore')
        .where('team.id = :team_id', { team_id })
        .andWhere('user.id = :user_id', { user_id })
        .getOne();

    const storesToRemove = userRoles?.user.store;

    if (storesToRemove) {
        const userStoresRepository = getRepository(UserStores);
        await userStoresRepository.remove(storesToRemove);
    }
}

export { getUserStoreOnTeam, removeUserFromAllStoresFromTeam };
