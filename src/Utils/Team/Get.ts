import { firestore } from 'firebase-admin';

import AppError from '@errors/AppError';

async function getTeam(team_id: string): Promise<ITeam> {
	const team = await firestore().collection('teams').doc(team_id).get();

	if (!team.exists) {
		throw new AppError({
			message: 'Team not found',
			internalErrorCode: 6,
		});
	}

	return team.data() as ITeam;
}

export { getTeam };
