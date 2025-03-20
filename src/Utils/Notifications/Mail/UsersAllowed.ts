import { getAllUsersIDAllowedToSendEmail } from '@services/Notification/Email';

import { getAllUserRoles } from '@utils/UserRoles';

import UserTeam from '@models/UserTeam';

async function getUsersAllowedToSendMail(): Promise<UserTeam[]> {
	const usersTeams = await getAllUserRoles();

	const allowedUsers = await getAllUsersIDAllowedToSendEmail();

	const filtedUsersTeams = usersTeams.filter(item => {
		const isAllowed = allowedUsers.find(user => user.id === item.user.id);

		if (!isAllowed) {
			return false;
		}
		return true;
	});

	return filtedUsersTeams;
}

export { getUsersAllowedToSendMail };
