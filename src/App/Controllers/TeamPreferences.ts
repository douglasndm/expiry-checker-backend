import { Request, Response } from 'express';

import { getPreferencesFromTeam } from '@utils/Team/Preferences';

class TeamPreferences {
    async index(req: Request, res: Response): Promise<Response> {
        const { team_id } = req.params;

        const preferences = await getPreferencesFromTeam({ team_id });

        return res.json(preferences);
    }
}

export default new TeamPreferences();
