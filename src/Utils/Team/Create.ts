import { defaultDataSource } from '@services/TypeORM';

import Team from '@models/Team';
import UserTeam from '@models/UserTeam';
import User from '@models/User';

import AppError from '@errors/AppError';

async function createTeam({ name, admin_id }: createTeamProps): Promise<Team> {
	const teamRepository = defaultDataSource.getRepository(Team);
	const userRolesRepository = defaultDataSource.getRepository(UserTeam);
	const userRepository = defaultDataSource.getRepository(User);

	const user = await userRepository.findOne({
		where: {
			firebaseUid: admin_id,
		},
	});

	if (!user) {
		throw new AppError({
			message: 'User was not found',
			statusCode: 400,
			internalErrorCode: 7,
		});
	}

	// Check if user already has a team with the same name
	const userTeams = await userRolesRepository
		.createQueryBuilder('userTeams')
		.leftJoinAndSelect('userTeams.team', 'team')
		.leftJoinAndSelect('userTeams.user', 'user')
		.where('user.firebaseUid = :user_id', { user_id: user?.firebaseUid })
		.getMany();

	const alreadyManager = userTeams.filter(
		ur => ur.role.toLowerCase() === 'manager'
	);

	if (alreadyManager.length > 0) {
		throw new AppError({
			message: 'You are already a manager of another team',
			statusCode: 400,
		});
	}

	const existsName = userTeams.filter(roles => {
		if (roles.team.name) {
			if (roles.team.name.toLowerCase() === name?.toLowerCase()) {
				return true;
			}
		}

		return false;
	});

	if (existsName.length > 0) {
		throw new AppError({
			message: 'You already have a team with the same name',
			statusCode: 400,
			internalErrorCode: 14,
		});
	}

	const team = new Team();
	team.name = name;

	const savedTeam = await teamRepository.save(team);

	const userRole = new UserTeam();
	userRole.team = savedTeam;
	userRole.user = user;
	userRole.role = 'manager';

	await userRolesRepository.save(userRole);

	return savedTeam;
}

export { createTeam };
