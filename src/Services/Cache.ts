import Redis, { Redis as RedisClient } from 'ioredis';

import cacheConfig from '@config/Cache';

export default class RedisCache {
    private client: RedisClient;

    constructor() {
        this.client = new Redis(cacheConfig.config.redis);
    }

    public async get<T>(key: any): Promise<T | null> {
        console.log('Restaurado do cache');
        const response = await this.client.get(key);

        if (!response) {
            return null;
        }

        const parsedData = JSON.parse(response) as T;

        return parsedData;
    }

    public async save(key: string, value: any): Promise<void> {
        console.log('Salvo em cache');
        await this.client.set(key, JSON.stringify(value));
    }

    public async invalidade(key: string): Promise<void> {
        console.log('Cache invalidado');
        await this.client.del(key);
    }

    public async invalidadePrefix(prefix: string): Promise<void> {
        const keys = await this.client.keys(`${prefix}:*`);

        const pipeline = this.client.pipeline();

        keys.forEach(key => {
            pipeline.del(key);
        });

        await pipeline.exec();
    }
}
