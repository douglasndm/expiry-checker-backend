import { firestore } from 'firebase-admin';

import { defaultDataSource } from '@services/TypeORM';
import { invalidadeCache } from '@services/Cache/Redis';

import UserTeam from '@models/UserTeam';

import { removeFromALlStores } from '@utils/Stores/Users';

import AppError from '@errors/AppError';

import { getUserRole } from './Find';

interface updateRoleProps {
	role: string;
	user_id: string;
	team_id: string;
}

async function updateRole({
	role,
	user_id,
	team_id,
}: updateRoleProps): Promise<UserTeam> {
	const fixedRole = role.toLowerCase().trim();

	if (
		fixedRole !== 'manager' &&
		fixedRole !== 'supervisor' &&
		fixedRole !== 'repositor'
	) {
		throw new AppError({
			message: 'Invalid role',
			internalErrorCode: 21,
		});
	}

	const roleRepository = defaultDataSource.getRepository(UserTeam);

	const findedRole = await getUserRole({ user_id, team_id });

	findedRole.role = fixedRole;

	const updatedRole = await roleRepository.save(findedRole);

	const teamsCollection = firestore().collection('teams');
	const teamRef = teamsCollection.doc(team_id);

	const roleRef = teamRef.collection('roles').doc(user_id);

	await roleRef.update({
		name: fixedRole,

		updatedAt: firestore.Timestamp.fromDate(new Date()),
	});

	await invalidadeCache(`team_users:${team_id}`);

	return updatedRole;
}

interface removeUserProps {
	user_id: string;
	team_id: string;
}

async function removeUser({
	user_id,
	team_id,
}: removeUserProps): Promise<void> {
	const roleRepository = defaultDataSource.getRepository(UserTeam);
	const role = await getUserRole({ user_id, team_id });

	if (role.role.toLowerCase() === 'manager') {
		throw new AppError({
			message: 'You cannot remove a manager from team',
			internalErrorCode: 41,
			statusCode: 401,
		});
	}

	await removeFromALlStores(user_id);
	await roleRepository.remove(role);

	const teamsCollection = firestore().collection('teams');
	const teamRef = teamsCollection.doc(team_id);

	const roleRef = teamRef.collection('roles').doc(user_id);

	await roleRef.delete();

	await invalidadeCache(`team_users:${team_id}`);
}
export { updateRole, removeUser };
