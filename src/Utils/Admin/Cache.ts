import Cache from '@services/Cache';

async function clearVersionCache(): Promise<void> {
    const cache = new Cache();

    await cache.invalidade('latest_version');
}

async function clearAllCache(): Promise<void> {
    const cache = new Cache();

    await cache.invalidade('users_devices');
    await cache.invalidadePrefix('team_brands');
    await cache.invalidadePrefix('product');
    await cache.invalidadePrefix('products-from-teams');
    await cache.invalidadePrefix('products-from-category');
    await cache.invalidadePrefix('products-from-brand');
    await cache.invalidadePrefix('users-from-teams');

    await clearVersionCache();
}

export { clearAllCache, clearVersionCache };
