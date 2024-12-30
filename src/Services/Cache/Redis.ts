import IORedis, { Redis } from 'ioredis';

import { captureException } from '@services/ExceptionsHandler';

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

let redis: Redis | null = null;

// Função para conectar ao Redis
async function connectToRedis(): Promise<void> {
    try {
        redis = new IORedis({
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            password: process.env.REDIS_PASS || undefined,

            maxRetriesPerRequest: 30,
            enableReadyCheck: false,
            retryStrategy(times) {
                if (times > 3) {
                    return null;
                }
                return Math.min(times * 100, 3000);
            },
        });

        await redis.ping(); // Verifica se a conexão está funcionando
        console.log('Connected to Redis at: ', process.env.REDIS_HOST);
    } catch (error) {
        console.error('Erro ao conectar ao Redis:', error);
        redis = null;
    }
}

async function checkAndClear() {
    if (!redis) {
        return;
    }

    redis.info((err, info) => {
        if (err || !info) {
            console.error(
                'Erro ao recuperar informações do servidor Redis:',
                err,
            );

            if (err instanceof Error) {
                captureException(err);
            }
            return;
        }

        // Analisando as informações retornadas
        const lines = info.split('\r\n');
        let usedMemoryBytes = 0;

        // Iterando sobre as linhas para encontrar a quantidade de memória usada
        lines.forEach(line => {
            if (line.startsWith('used_memory:')) {
                const parts = line.split(':');
                usedMemoryBytes = parseInt(parts[1]);
            }
        });

        // Convertendo para MB
        const usedMemoryMB = usedMemoryBytes / (1024 * 1024);

        if (redis) {
            if (usedMemoryMB > 150) {
                console.log(
                    'Redis is using: ',
                    usedMemoryMB.toFixed(2),
                    'MB of memory',
                );

                console.log('Clearing Redis cache...');
                redis.flushall();
            }
        }
    });
}

async function getFromCache<T>(key: string): Promise<T | null> {
    // Se não estiver conectado, tenta conectar novamente
    if (!redis) {
        console.log('Tentando reconectar ao Redis...');
        await connectToRedis();
        if (!redis) {
            console.log(
                'Não foi possível se reconectar ao Redis. Usando o cache indisponível.',
            );
            return null;
        }
    }

    try {
        const data = await redis.get(key);

        if (!data) {
            return null;
        }

        const parsedData = JSON.parse(data) as T;

        return parsedData;
    } catch (error) {
        if (error instanceof Error) {
            captureException(error);
        }
        console.error('Erro ao obter dados do cache: ', error);
        return null;
    }
}

async function saveOnCache(key: string, value: any): Promise<void> {
    // Se não estiver conectado, tenta conectar novamente
    if (!redis) {
        console.log('Tentando reconectar ao Redis...');
        await connectToRedis();
        if (!redis) {
            console.log(
                'Não foi possível se reconectar ao Redis. Usando o cache indisponível.',
            );
            return;
        }
    }

    try {
        await checkAndClear();

        await redis.set(key, JSON.stringify(value));
    } catch (error) {
        if (error instanceof Error) {
            captureException(error);
        }
        console.error('Erro ao salvar dados no cache: ', error);
    }
}

async function invalidadeCache(key: string): Promise<void> {
    // Se não estiver conectado, tenta conectar novamente
    if (!redis) {
        console.log('Tentando reconectar ao Redis...');
        await connectToRedis();
        if (!redis) {
            console.log(
                'Não foi possível se reconectar ao Redis. Usando o cache indisponível.',
            );
            return;
        }
    }

    try {
        await redis.del(key);
    } catch (error) {
        if (error instanceof Error) {
            captureException(error);
        }
        console.error('Erro ao invalidar dados do cache: ', error);
    }
}

async function invalidadePrefix(prefix: string): Promise<void> {
    // Se não estiver conectado, tenta conectar novamente
    if (!redis) {
        console.log('Tentando reconectar ao Redis...');
        await connectToRedis();
        if (!redis) {
            console.log(
                'Não foi possível se reconectar ao Redis. Usando o cache indisponível.',
            );
            return;
        }
    }

    try {
        const keys = await redis.keys(`${prefix}:*`);

        const pipeline = redis.pipeline();

        if (!keys) return;
        keys.forEach(key => {
            pipeline.del(key);
        });

        await pipeline.exec();
    } catch (error) {
        if (error instanceof Error) {
            captureException(error);
        }
        console.error(
            `Erro ao invalidar o cache com o prefixo: ${prefix} `,
            error,
        );
    }
}

async function invalidadeTeamCache(team_id: string): Promise<void> {
    // Se não estiver conectado, tenta conectar novamente
    if (!redis) {
        console.log('Tentando reconectar ao Redis...');
        await connectToRedis();
        if (!redis) {
            console.log(
                'Não foi possível se reconectar ao Redis. Usando o cache indisponível.',
            );
            return;
        }
    }

    try {
        const keys = await redis.keys(`*${team_id}*`);

        const pipeline = redis.pipeline();

        if (!keys) return;
        keys.forEach(key => {
            pipeline.del(key);
        });

        await pipeline.exec();
    } catch (error) {
        if (error instanceof Error) {
            captureException(error);
        }
        console.error(`Erro ao invalidar o cache do time: ${team_id} `, error);
    }
}

async function invalidadeAllCache(): Promise<void> {
    // Se não estiver conectado, tenta conectar novamente
    if (!redis) {
        console.log('Tentando reconectar ao Redis...');
        await connectToRedis();
        if (!redis) {
            console.log(
                'Não foi possível se reconectar ao Redis. Usando o cache indisponível.',
            );
            return;
        }
    }

    try {
        await redis.flushall();
    } catch (error) {
        if (error instanceof Error) {
            captureException(error);
        }
        console.error('Erro ao invalidar todo o cache: ', error);
    }
}

connectToRedis();

export {
    getFromCache,
    saveOnCache,
    invalidadeCache,
    invalidadePrefix,
    invalidadeTeamCache,
    invalidadeAllCache,
};
