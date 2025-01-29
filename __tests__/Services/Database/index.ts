import { testDataSource } from '@services/TypeORM.test';

const connection = {
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
