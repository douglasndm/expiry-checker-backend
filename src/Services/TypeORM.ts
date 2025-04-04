import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

import Batch from '@models/Batch';
import Category from '@models/Category';
import Product from '@models/Product';
import Brand from '@models/Brand';
import Team from '@models/Team';
import Store from '@models/Store';
import User from '@models/User';
import UserTeam from '@models/UserTeam';
import TeamSubscriptions from '@models/TeamSubscription';
import ProductDetails from '@models/ProductDetails';
import UsersStores from '@models/UsersStores';
import UserLogs from '@models/UserLogs';
import TeamPreferences from '@models/TeamPreferences';
import NotificationsPreferences from '@models/NotificationsPreferences';

dotenv.config({ path: '../../.env' });

const entities = [
	Batch,
	Category,
	Product,
	Brand,
	Team,
	Store,
	User,
	UserTeam,
	TeamSubscriptions,
	ProductDetails,
	UsersStores,
	UserLogs,
	TeamPreferences,
	NotificationsPreferences,
];

let migrationPath = './dist/src/Services/Database/Typeorm/migrations/*.js';

if (process.env.DEV_MODE === 'true') {
	migrationPath = './src/Services/Database/Typeorm/migrations/*.ts';
}

export const defaultDataSource = new DataSource({
	name: 'default',
	type: 'postgres',
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	username: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	entities,
	migrations: [migrationPath],
	synchronize: false,
	logging: false,
});
