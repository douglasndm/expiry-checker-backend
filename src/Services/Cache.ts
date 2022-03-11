import Redis, { Redis as RedisClient } from 'ioredis';

import cacheConfig from '@config/Cache';

export default class RedisCache {
    private client: RedisClient;

    constructor() {
        this.client = new Redis(cacheConfig.config.redis);
    }

    public async get<T>(key: any): Promise<T | null> {
        const response = await this.client.get(key);

        if (!response) {
            return null;
        }

        // if (process.env.DEV_MODE)
        //     console.log(`Getting from cache. Key -> ${key}`);

        const parsedData = JSON.parse(response) as T;

        return parsedData;
    }

    public async save(key: string, value: any): Promise<void> {
        await this.client.set(key, JSON.stringify(value));

        // if (process.env.DEV_MODE) console.log(`Saving in cache. Key -> ${key}`);
    }

    public async invalidade(key: string): Promise<void> {
        await this.client.del(key);

        // if (process.env.DEV_MODE)
        //     console.log(`Invalidaing cache. Key -> ${key}`);
    }

    public async invalidadePrefix(prefix: string): Promise<void> {
        const keys = await this.client.keys(`${prefix}:*`);

        const pipeline = this.client.pipeline();

        keys.forEach(key => {
            pipeline.del(key);
        });

        await pipeline.exec();
    }

    public async invalidadeAllCache(): Promise<void> {
        await this.client.flushall();
    }
}
