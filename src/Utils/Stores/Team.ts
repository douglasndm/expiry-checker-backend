import * as Yup from 'yup';

import { getAllStoresFromUser } from '@utils/Stores/Users';

import AppError from '@errors/AppError';

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

export { getUserStoreOnTeam };
