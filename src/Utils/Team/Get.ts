import { defaultDataSource } from '@services/TypeORM';

import Team from '@models/Team';

import AppError from '@errors/AppError';

async function getTeam(team_id: string): Promise<ITeam> {
	const repository = defaultDataSource.getRepository(Team);
	const team = await repository
		.createQueryBuilder('team')
		.where('team.id = :team_id', { team_id })
		.getOne();

	if (!team) {
		throw new AppError({
			message: 'Team not found',
			internalErrorCode: 6,
		});
	}

	return team;
}

export { getTeam };
