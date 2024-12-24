import * as Yup from 'yup';

import { defaultDataSource } from '@project/ormconfig';

import TeamPreferences from '@models/TeamPreferences';

import AppError from '@errors/AppError';

import { getTeamById } from './Find';

interface getPreferencesFromTeamProps {
    team_id: string;
}

async function getPreferencesFromTeam({
    team_id,
}: getPreferencesFromTeamProps): Promise<TeamPreferences> {
    const preferencesRepository =
        defaultDataSource.getRepository(TeamPreferences);

    let preferences = await preferencesRepository
        .createQueryBuilder('prefe')
        .leftJoinAndSelect('prefe.team', 'team')
        .where('team.id = :team_id', { team_id })
        .select(['prefe.daysToBeNext'])
        .getOne();

    if (!preferences) {
        const team = await getTeamById(team_id);

        const prefe = new TeamPreferences();
        prefe.team = team;
        prefe.daysToBeNext = 30;

        preferences = await preferencesRepository.save(prefe);
    }

    return preferences;
}

interface updateTeamPreferencesProps {
    team_id: string;
    daysToBeNext?: number;
}

async function updateTeamPreferences({
    team_id,
    daysToBeNext,
}: updateTeamPreferencesProps): Promise<TeamPreferences> {
    const schema = Yup.object().shape({
        daysToBeNext: Yup.number(),
    });

    try {
        await schema.validate({ daysToBeNext });
    } catch (err) {
        if (err instanceof Error)
            throw new AppError({
                message: err.message,
                internalErrorCode: 1,
            });
    }

    const preferencesRepository =
        defaultDataSource.getRepository(TeamPreferences);

    let preferences = await preferencesRepository
        .createQueryBuilder('prefe')
        .leftJoinAndSelect('prefe.team', 'team')
        .where('team.id = :team_id', { team_id })
        .getOne();

    if (!preferences) {
        const team = await getTeamById(team_id);

        const prefe = new TeamPreferences();
        prefe.team = team;

        if (daysToBeNext !== undefined) {
            prefe.daysToBeNext = daysToBeNext;
        }

        preferences = await preferencesRepository.save(prefe);
    } else {
        if (daysToBeNext !== undefined) {
            preferences.daysToBeNext = daysToBeNext;
        }

        const updatedProd = await preferencesRepository.save(preferences);
        return updatedProd;
    }

    return preferences;
}

export { getPreferencesFromTeam, updateTeamPreferences };
