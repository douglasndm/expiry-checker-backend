import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import TeamPreferences from '@models/TeamPreferences';

import { getTeam } from '@functions/Team';

import AppError from '@errors/AppError';

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

interface updateTeamPreferencesProps {
    team_id: string;
    allowCollectProduct?: boolean;
    daysToBeNext?: number;
}

async function updateTeamPreferences({
    team_id,
    allowCollectProduct,
    daysToBeNext,
}: updateTeamPreferencesProps): Promise<TeamPreferences> {
    const schema = Yup.object().shape({
        allowCollectProduct: Yup.bool(),
        daysToBeNext: Yup.number(),
    });

    try {
        await schema.validate({ allowCollectProduct, daysToBeNext });
    } catch (err) {
        if (err instanceof Error)
            throw new AppError({
                message: err.message,
                internalErrorCode: 1,
            });
    }

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

        if (allowCollectProduct !== undefined) {
            prefe.allowCollectProduct = allowCollectProduct;
        }

        if (daysToBeNext !== undefined) {
            prefe.daysToBeNext = daysToBeNext;
        }

        preferences = await preferencesRepository.save(prefe);
    } else {
        if (allowCollectProduct !== undefined) {
            preferences.allowCollectProduct = allowCollectProduct;
        }

        if (daysToBeNext !== undefined) {
            preferences.daysToBeNext = daysToBeNext;
        }

        const updatedProd = await preferencesRepository.save(preferences);
        return updatedProd;
    }

    return preferences;
}

export { getPreferencesFromTeam, updateTeamPreferences };
