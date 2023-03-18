import Cache from '@services/Cache';

async function clearAllCache(): Promise<void> {
    const cache = new Cache();
    await cache.invalidadeAllCache();
}

export { clearAllCache };
