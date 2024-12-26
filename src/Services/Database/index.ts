import { defaultDataSource } from '@services/TypeORM';

async function setConnection(): Promise<void> {
    if (!defaultDataSource.isInitialized) {
        await defaultDataSource.initialize();
    }
}

setConnection();
