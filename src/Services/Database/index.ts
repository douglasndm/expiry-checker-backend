import { createConnection, getConnectionOptions } from 'typeorm';

import Batch from '@models/Batch';
import Category from '@models/Category';
import Product from '@models/Product';
import Team from '@models/Team';
import User from '@models/User';
import UserRoles from '@models/UserRoles';
import ProductTeams from '@models/ProductTeams';
import ProductCategory from '@models/ProductCategory';
import TeamSubscriptions from '@models/TeamSubscription';
import UserDevice from '@models/UserDevice';

import NotificationsPreferences from '@models/NotificationsPreferences';

async function setConnection(): Promise<void> {
    const defaultOptions = await getConnectionOptions();

    createConnection(
        Object.assign(defaultOptions, {
            entities: [
                Batch,
                Category,
                Product,
                Team,
                User,
                UserRoles,
                ProductTeams,
                ProductCategory,
                TeamSubscriptions,
                UserDevice,
                NotificationsPreferences,
            ],
        }),
    );
}

setConnection();
