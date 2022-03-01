import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import Store from '@models/Store';

import { isUserManager } from '@functions/Users/UserRoles';
import { getTeam } from '@functions/Team';

import AppError from '@errors/AppError';

interface createStoreProps {
    name: string;
    team_id: string;
    admin_id: string;
}

async function createStore({
    name,
    team_id,
    admin_id,
}: createStoreProps): Promise<Store> {
    const schema = Yup.object().shape({
        name: Yup.string().required(),
        team_id: Yup.string().uuid().required(),
        admin_id: Yup.string().uuid().required(),
    });

    try {
        await schema.validate({ name, team_id, admin_id });
    } catch (err) {
        if (err instanceof Error) {
            throw new AppError({
                message: err.message,
            });
        }
    }

    // Check if user has access and it is a manager on team
    const isManager = await isUserManager({
        user_id: admin_id,
        team_id,
        useInternalId: true, // force check to look for own uuid and not firebase
    });

    if (!isManager) {
        throw new AppError({
            message: 'Only managers can create stores',
            internalErrorCode: 35,
        });
    }

    const team = await getTeam({ team_id });

    const storeRepository = getRepository(Store);

    const store = new Store();
    store.name = name.trim();
    store.team = team;

    const createdStore = await storeRepository.save(store);

    return createdStore;
}

export { createStore };
