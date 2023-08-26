import { Redis as RedisClient } from 'ioredis';

import { redisClient } from '@services/Redis';

// team_products:team_id
// team_brands:team_id
// team_categories:team_id
// team_stores:team_id
// team_users:team_id

// product:team_id:product_id
// store_products:team_id:store_id
// category_products:team_id:category_id
// brand_products:team_id:brand_id

// users_devices
// users_logins

// external_api_request

// product_suggestion:${code}

export default class RedisCache {
    private client: RedisClient;

    constructor() {
        this.client = redisClient;
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

        if (!keys) return;
        keys.forEach(key => {
            pipeline.del(key);
        });

        await pipeline.exec();
    }

    public async invalidadeTeamCache(team_id: string): Promise<void> {
        const keys = await this.client.keys(`*${team_id}*`);

        const pipeline = this.client.pipeline();

        if (!keys) return;
        keys.forEach(key => {
            pipeline.del(key);
        });

        await pipeline.exec();
    }

    public async invalidadeAllCache(): Promise<void> {
        await this.client.flushall();
    }
}
