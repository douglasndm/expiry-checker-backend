import { createConnection, getConnection, getConnectionOptions } from 'typeorm';

import { entities } from '@services/Database/index';

const connection = {
    async create(): Promise<void> {
        const defaultOptions = await getConnectionOptions('test');

        const conn = {
            ...defaultOptions,
            dropSchema: true,
            migrationsRun: true,
            entities,
            name: 'default',
        };

        await createConnection(Object.assign(conn));
    },

    async close(): Promise<void> {
        await getConnection().close();
    },

    async clear(): Promise<void> {
        const conn = getConnection();
        const entitiesLocal = conn.entityMetadatas;

        const entityDeletionPromises = entitiesLocal.map(entity => async () => {
            const repository = conn.getRepository(entity.name);
            await repository.query(`DELETE FROM ${entity.tableName}`);
        });
        await Promise.all(entityDeletionPromises);
    },
};

export default connection;
