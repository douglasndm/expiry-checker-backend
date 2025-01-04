import { testDataSource } from '@services/TypeORM';

const connection = {
    async create(): Promise<void> {
        await testDataSource.initialize();
    },

    async close(): Promise<void> {
        await testDataSource.destroy();
    },

    async clear(): Promise<void> {
        const entitiesLocal = testDataSource.entityMetadatas;

        const entityDeletionPromises = entitiesLocal.map(entity => async () => {
            const repository = testDataSource.getRepository(entity.name);
            await repository.query(`DELETE FROM ${entity.tableName}`);
        });
        await Promise.all(entityDeletionPromises);
    },
};

export default connection;
