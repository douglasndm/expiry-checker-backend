import { defaultDataSource } from '@project/ormconfig';

import Team from '@models/Team';

import AppError from '@errors/AppError';

async function getTeamById(id: string): Promise<Team> {
    const teamReposity = defaultDataSource.getRepository(Team);

    const team = await teamReposity
        .createQueryBuilder('team')
        .where('team.id = :id', { id })
        .getOne();

    if (!team) {
        throw new AppError({
            message: 'Team not found',
            internalErrorCode: 6,
        });
    }

    return team;
}

export { getTeamById };
