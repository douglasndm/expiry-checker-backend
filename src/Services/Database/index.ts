import { createConnection, getConnectionOptions } from 'typeorm';

import Batch from '@models/Batch';
import Category from '@models/Category';
import Product from '@models/Product';
import Brand from '@models/Brand';
import Team from '@models/Team';
import Store from '@models/Store';
import User from '@models/User';
import UserTeam from '@models/UserTeam';
import ProductTeams from '@models/ProductTeams';
import ProductCategory from '@models/ProductCategory';
import TeamSubscriptions from '@models/TeamSubscription';
import ProductDetails from '@models/ProductDetails';
import ProductRequest from '@models/ProductRequest';
import UsersStores from '@models/UsersStores';
import UserLogin from '@models/UserLogin';
import UserLogs from '@models/UserLogs';

import TeamPreferences from '@models/TeamPreferences';
import NotificationsPreferences from '@models/NotificationsPreferences';

export const entities = [
    Batch,
    Category,
    Product,
    Brand,
    Team,
    Store,
    User,
    UserTeam,
    ProductTeams,
    ProductCategory,
    TeamSubscriptions,
    ProductDetails,
    ProductRequest,
    UsersStores,
    TeamPreferences,
    NotificationsPreferences,
    UserLogin,
    UserLogs,
];

async function setConnection(): Promise<void> {
    const defaultOptions = await getConnectionOptions();

    createConnection(
        Object.assign(defaultOptions, {
            entities,
        }),
    );
}

setConnection();
