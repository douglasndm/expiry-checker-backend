import { getUserByFirebaseId } from '@utils/User/Find';
import { getUserStore } from '@utils/Stores/User/GetStore';
import { getTeamFromUser } from '@utils/User/Team';

import Team from '@models/Team';

interface Props {
	firebaseUid: string;
}

interface Response {
	id: string;
	name?: string;
	lastName?: string;
	email: string;
	role?: {
		name: string;
		status: string | null;
		code: string | null;
		team?: Team;
		store: IStore | null;
	};
}

async function createSession(Props: Props): Promise<Response> {
	const { firebaseUid } = Props;

	const user = await getUserByFirebaseId(firebaseUid);

	const userTeam = await getTeamFromUser(user.id);

	const team = { ...userTeam };
	const { role, status, code } = team;

	const store = await getUserStore(user.id);

	let response: Response = {
		id: user.id,
		name: user.name || undefined,
		lastName: user.lastName || undefined,
		email: user.email,
	};

	if (role) {
		response = {
			...response,
			role: {
				name: role ? role.toLowerCase() : '',
				status: status ? status.toLowerCase() : null,
				code: code || null,
				team: team.team,
				store,
			},
		};
	}

	return response;
}

export { createSession };
