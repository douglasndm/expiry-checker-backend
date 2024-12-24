import { defaultDataSource } from '@project/ormconfig';

async function setConnection(): Promise<void> {
    if (!defaultDataSource.isInitialized) {
        await defaultDataSource.initialize();
    }
}

setConnection();
