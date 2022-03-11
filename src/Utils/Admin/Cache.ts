import Cache from '@services/Cache';

async function clearVersionCache(): Promise<void> {
    const cache = new Cache();

    await cache.invalidade('latest_version');
}

async function clearAllCache(): Promise<void> {
    const cache = new Cache();
    await cache.invalidadeAllCache();
}

export { clearAllCache, clearVersionCache };
