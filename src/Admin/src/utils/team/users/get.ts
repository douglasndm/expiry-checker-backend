import { defaultDataSource } from '@services/TypeORM';

import UserRoles from '@models/UserTeam';

async function getAllUsersInTeam(team_id: string): Promise<UserRoles[]> {
	const rolesRepository = defaultDataSource.getRepository(UserRoles);

	const roles = await rolesRepository
		.createQueryBuilder('roles')
		.leftJoinAndSelect('roles.user', 'user')
		.leftJoinAndSelect('user.store', 'userStore')
		.leftJoinAndSelect('userStore.store', 'store')
		.leftJoin('roles.team', 'team')
		.select([
			'roles.role',
			'roles.status',
			'roles.code',
			'user.id',
			'user.name',
			'user.lastName',
			'user.email',
			'user.firebaseUid',

			'userStore',

			'store.id',
			'store.name',
		])
		.where('team.id = :team_id', { team_id })
		.getMany();

	return roles;
}

export { getAllUsersInTeam };
