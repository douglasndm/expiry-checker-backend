import * as Yup from 'yup';

import { defaultDataSource } from '@services/TypeORM';

import { invalidadeCache } from '@services/Cache/Redis';

import Store from '@models/Store';

import { isManager } from '@utils/Team/Roles/Manager';

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
	const isAManager = await isManager({
		user_id: admin_id,
		team_id,
	});

	if (!isAManager) {
		throw new AppError({
			message: 'Only managers can delete stores',
			internalErrorCode: 35,
		});
	}

	const storeRepository = defaultDataSource.getRepository(Store);
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

	await invalidadeCache(`team_stores:${team_id}`);
	await invalidadeCache(`store_products:${team_id}:${store_id}`);
}

export { deleteStore };
