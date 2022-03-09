import { Request, Response } from 'express';

import {
    getPreferencesFromTeam,
    updateTeamPreferences,
} from '@utils/Team/Preferences';

class TeamPreferences {
    async index(req: Request, res: Response): Promise<Response> {
        const { team_id } = req.params;

        const preferences = await getPreferencesFromTeam({ team_id });

        return res.json(preferences);
    }

    async update(req: Request, res: Response): Promise<Response> {
        const { team_id } = req.params;
        const { allowCollectProduct, daysToBeNext } = req.body;

        const preferences = await updateTeamPreferences({
            team_id,
            allowCollectProduct,
            daysToBeNext,
        });

        return res.json(preferences);
    }
}

export default new TeamPreferences();
