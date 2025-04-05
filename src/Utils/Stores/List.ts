import { firestore } from 'firebase-admin';

import { defaultDataSource } from '@services/TypeORM';

import { getFromCache, saveOnCache } from '@services/Cache/Redis';

import Store from '@models/Store';

interface getAllStoresFromTeamProps {
	team_id: string;
}
async function getAllStoresFromTeam({
	team_id,
}: getAllStoresFromTeamProps): Promise<Store[]> {
	const cached = await getFromCache<Store[]>(`team_stores:${team_id}`);

	if (cached) {
		return cached;
	}

	const storeRepository = defaultDataSource.getRepository(Store);

	const stores = await storeRepository
		.createQueryBuilder('stores')
		.leftJoinAndSelect('stores.team', 'team')
		.where('team.id = :team_id', { team_id })
		.select(['stores.id', 'stores.name'])
		.getMany();

	await saveOnCache(`team_stores:${team_id}`, stores);

	return stores;
}

async function getStoresFromTeamOnFirestore(team_id: string) {
	const teamCollection = firestore().collection('teams').doc(team_id);

	const stores = await teamCollection.collection('stores').get();

	return stores.docs.map(doc => {
		return {
			id: doc.id,
			name: doc.data().name,
		};
	});
}

export { getAllStoresFromTeam, getStoresFromTeamOnFirestore };
