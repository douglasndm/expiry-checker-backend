import { getRepository } from 'typeorm';

import TeamPreferences from '@models/TeamPreferences';

import { getTeam } from '@functions/Team';

interface getPreferencesFromTeamProps {
    team_id: string;
}

async function getPreferencesFromTeam({
    team_id,
}: getPreferencesFromTeamProps): Promise<TeamPreferences> {
    const preferencesRepository = getRepository(TeamPreferences);

    let preferences = await preferencesRepository
        .createQueryBuilder('prefe')
        .leftJoinAndSelect('prefe.team', 'team')
        .where('team.id = :team_id', { team_id })
        .getOne();

    if (!preferences) {
        const team = await getTeam({ team_id });

        const prefe = new TeamPreferences();
        prefe.team = team;
        prefe.allowCollectProduct = false;
        prefe.daysToBeNext = 30;

        preferences = await preferencesRepository.save(prefe);
    }

    return preferences;
}

export { getPreferencesFromTeam };
