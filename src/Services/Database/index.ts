import { createConnection, getConnectionOptions } from 'typeorm';

import { Batch } from '../../Models/Batch';
import { Category } from '../../Models/Category';
import { Product } from '../../Models/Product';
import { Team } from '../../Models/Team';
import { User } from '../../Models/User';

async function setConnection(): Promise<void> {
    const defaultOptions = await getConnectionOptions();

    createConnection(
        Object.assign(defaultOptions, {
            entities: [Batch, Category, Product, Team, User],
        }),
    );
}

setConnection();
