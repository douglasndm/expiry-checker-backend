import Cache from '@services/Cache';

async function clearAllCache(): Promise<void> {
    const cache = new Cache();

    await cache.invalidade('users_devices');
    await cache.invalidadePrefix('team_brands');
    await cache.invalidadePrefix('product');
    await cache.invalidadePrefix('products-from-teams');
    await cache.invalidadePrefix('users-from-teams');
}

export { clearAllCache };
