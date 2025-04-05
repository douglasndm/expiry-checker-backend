import { defaultDataSource } from '@services/TypeORM';
import { invalidadeTeamCache } from '@services/Cache/Redis';

import Team from '@models/Team';

import AppError from '@errors/AppError';

interface IUpdateTeam {
	team_id: string;
	team_name: string;
}

async function updateTeam(team: IUpdateTeam): Promise<Team> {
	const { team_id, team_name } = team;

	const teamRepository = defaultDataSource.getRepository(Team);

	const teamUpdated = await teamRepository
		.createQueryBuilder('team')
		.where('team.id = :team_id', { team_id: team_id })
		.getOne();

	if (!teamUpdated) {
		throw new AppError({
			message: 'Team not found',
			internalErrorCode: 6,
		});
	}

	teamUpdated.name = team_name;

	await teamRepository.save(teamUpdated);

	await invalidadeTeamCache(team_id);

	return teamUpdated;
}

export { updateTeam };
