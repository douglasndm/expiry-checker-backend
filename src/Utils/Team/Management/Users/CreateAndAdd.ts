import { createUser } from '@utils/User/Create';
import { addUserToTeam } from '@utils/Team/Roles/Create';
import { createUserOnFirebase } from '@utils/User/Firebase';

interface createAndAddUserOnTeamProps {
	name: string;
	lastName: string;
	email: string;
	password: string;
	team_id: string;
}

async function createAndAddUserOnTeam({
	name,
	lastName,
	email,
	password,
	team_id,
}: createAndAddUserOnTeamProps): Promise<void> {
	const firebaseUser = await createUserOnFirebase({
		name,
		lastName,
		email,
		password,
	});

	const user = await createUser({
		firebaseUid: firebaseUser.uid,
		name,
		lastName,
		email,
		password,
	});

	await addUserToTeam({ user_id: user.id, team_id, bypassCode: true });
}

export { createAndAddUserOnTeam };
