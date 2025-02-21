import { firestore } from 'firebase-admin';
import * as Yup from 'yup';

import { defaultDataSource } from '@services/TypeORM';

import { invalidadeTeamCache } from '@services/Cache/Redis';

import Store from '@models/Store';

import { isManager } from '@utils/Team/Roles/Manager';

import AppError from '@errors/AppError';

interface updateStoreProps {
	name: string;
	store_id: string;
	team_id: string;
	admin_id: string;
}

async function updateStore({
	name,
	store_id,
	team_id,
	admin_id,
}: updateStoreProps): Promise<Store> {
	const schema = Yup.object().shape({
		name: Yup.string().required(),
		store_id: Yup.string().uuid().required(),
		team_id: Yup.string().uuid().required(),
		admin_id: Yup.string().uuid().required(),
	});

	try {
		await schema.validate({ name, store_id, team_id, admin_id });
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
			message: 'Only managers can update stores',
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

	store.name = name;

	const updatedStore = await storeRepository.save(store);

	const storeCollections = firestore()
		.collection('teams')
		.doc(team_id)
		.collection('stores');

	const firebaseStore = await storeCollections.doc(store_id).get();

	if (firebaseStore.exists) {
		await firebaseStore.ref.update({
			name,
			updatedAt: new Date(),
		});
	}

	await invalidadeTeamCache(`${team_id}`);

	return updatedStore;
}

export { updateStore };
