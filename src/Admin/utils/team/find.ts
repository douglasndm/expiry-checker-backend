import { defaultDataSource } from '@services/TypeORM';

import Team from '@models/Team';
import UserRoles from '@models/UserTeam';

async function findTeamByName(team_name: string): Promise<Team[]> {
	const teamRepository = defaultDataSource.getRepository(Team);

	const team = await teamRepository
		.createQueryBuilder('team')
		.where('lower(team.name) like lower(:name)', { name: `%${team_name}%` })
		.getMany();

	return team;
}

async function findTeamByManagerEmail(
	managerEmail: string
): Promise<UserRoles | null> {
	const roleRepository = defaultDataSource.getRepository(UserRoles);

	const role = await roleRepository
		.createQueryBuilder('role')
		.leftJoinAndSelect('role.user', 'user')
		.leftJoinAndSelect('role.team', 'team')
		.select([
			'role.role',
			'role.status',
			'role.code',
			'user.id',
			'user.name',
			'user.lastName',
			'user.email',
			'user.firebaseUid',
			'team.id',
			'team.name',
		])
		.where('lower(user.email) = lower(:email)', { email: managerEmail })
		.getOne();

	return role || null;
}

export { findTeamByName, findTeamByManagerEmail };
