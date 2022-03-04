import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import Store from '@models/Store';

import { isUserManager } from '@functions/Users/UserRoles';

import AppError from '@errors/AppError';

interface deleteStoreProps {
    store_id: string;
    team_id: string;
    admin_id: string;
}

async function deleteStore({
    store_id,
    team_id,
    admin_id,
}: deleteStoreProps): Promise<void> {
    const schema = Yup.object().shape({
        store_id: Yup.string().uuid().required(),
        team_id: Yup.string().uuid().required(),
        admin_id: Yup.string().uuid().required(),
    });

    try {
        await schema.validate({ store_id, team_id, admin_id });
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
            message: 'Only managers can delete stores',
            internalErrorCode: 35,
        });
    }

    const storeRepository = getRepository(Store);
    const store = await storeRepository
        .createQueryBuilder('store')
        .where('store.id = :store_id', { store_id })
        .getOne();

    if (!store) {
        throw new AppError({
            message: 'Store not found',
            internalErrorCode: 37,
        });
    }

    await storeRepository.remove(store);
}

export { deleteStore };
