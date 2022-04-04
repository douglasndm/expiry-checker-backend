import { Request, Response } from 'express';

import { getAppsVersion } from '@utils/AppVersion';

class AppVersionController {
    async index(req: Request, res: Response): Promise<Response> {
        const versions = await getAppsVersion();

        return res.status(200).json(versions);
    }
}

export default new AppVersionController();
