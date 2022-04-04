import { getRepository } from 'typeorm';

import Cache from '@services/Cache';

import AppVersion from '@models/AppVersion';

async function getAppsVersion(): Promise<AppVersion[]> {
    const cache = new Cache();

    const cached = await cache.get<AppVersion[]>('latest_version');

    if (cached) {
        return cached;
    }

    const appVersionRepository = getRepository(AppVersion);
    const appsVersions = await appVersionRepository.find();

    await cache.save('latest_version', appsVersions);

    return appsVersions;
}

export { getAppsVersion };
