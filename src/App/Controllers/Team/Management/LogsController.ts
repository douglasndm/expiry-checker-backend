import { Request, Response } from 'express';

import { getTeamLogs } from '@utils/Team/Management/GetLogs';

class LogsController {
    async index(req: Request, res: Response): Promise<Response> {
        const { team_id } = req.params;

        const logs = await getTeamLogs({ team_id });

        return res.json(logs);
    }
}

export default new LogsController();
