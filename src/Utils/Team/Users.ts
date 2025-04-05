import { firestore } from 'firebase-admin';

import { getAllUsersFromTeam } from '@functions/Team/Users';

interface checkIfUserIsOnTeamProps {
	user_id: string;
	team_id: string;
}

async function checkIfUserIsOnTeam({
	user_id,
	team_id,
}: checkIfUserIsOnTeamProps): Promise<boolean> {
	const usersOnTeam = await getAllUsersFromTeam({
		team_id,
	});

	const isOnTeam = usersOnTeam.find(user => user.id === user_id);

	if (isOnTeam) return true;
	return false;
}

// user devices has the token to send a notification for user
// so this is used to send a notification for a team
async function getAllUsersFromTeamWithDevices(
	team_id: string
): Promise<IUser[]> {
	const usersSnapshot = await firestore()
		.collection('users')
		.where('device', '!=', null)
		.where('teamId', '==', team_id)
		.get();

	const users: IUser[] = [];

	usersSnapshot.forEach(doc => {
		users.push(doc.data() as IUser);
	});

	return users;
}

export { checkIfUserIsOnTeam, getAllUsersFromTeamWithDevices };
