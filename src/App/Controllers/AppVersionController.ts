import { Request, Response } from 'express';
import { getRepository } from 'typeorm';

import Cache from '@services/Cache';

import AppVersion from '@models/AppVersion';

class AppVersionController {
    async index(req: Request, res: Response): Promise<Response> {
        const cache = new Cache();

        const cached = await cache.get<AppVersion>('latest_version');

        if (!cached) {
            const appVersionRepository = getRepository(AppVersion);
            const appsVersions = await appVersionRepository.find();

            await cache.save('latest_version', appsVersions);

            return res.status(200).json(appsVersions);
        }

        return res.status(200).json(cached);
    }
}

export default new AppVersionController();
