import { firestore } from 'firebase-admin';

import { defaultDataSource } from '@services/TypeORM';

import { invalidadeTeamCache } from '@services/Cache/Redis';

import Team from '@models/Team';

import { deleteAllProductsFromTeam } from '@utils/Product/Delete';
import { deleteAllBrandsFromTeam } from '@utils/Brands/Delete';
import { deleteAllLogsFromTeam } from '@utils/Team/Management/Logs/Delete';

import { getTeamById } from './Find';

async function deleteTeam(team_id: string): Promise<void> {
	const teamRepository = defaultDataSource.getRepository(Team);

	const team = await getTeamById(team_id);
	// this is for fix "error: update or delete on table "brands" violates foreign key constraint"
	await deleteAllProductsFromTeam(team_id);
	await deleteAllBrandsFromTeam(team_id);
	await deleteAllLogsFromTeam(team_id);

	await teamRepository.remove(team);

	await invalidadeTeamCache(team_id);

	const firestoreTeam = await firestore()
		.collection('teams')
		.doc(team_id)
		.get();

	if (firestoreTeam.exists) {
		await firestoreTeam.ref.delete();
	}
}

export { deleteTeam };
