import { defaultDataSource } from '@services/TypeORM';

async function setConnection(): Promise<void> {
	await defaultDataSource.initialize();
}

setConnection();
