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
import ProductRequest from '@models/ProductRequest';
import UsersStores from '@models/UsersStores';
import UserLogin from '@models/UserLogin';
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
	ProductRequest,
	UsersStores,
	UserLogin,
	UserLogs,
	TeamPreferences,
	NotificationsPreferences,
];

let migrationPath = './dist/src/Services/Database/Typeorm/migrations/*.js';

if (process.env.DEV_MODE === 'true') {
	migrationPath = './src/Services/Database/Typeorm/migrations/*.ts';
}

export const testDataSource = new DataSource({
	name: 'test',
	type: 'postgres',
	host: process.env.DB_TEST_HOST,
	port: Number(process.env.DB_TEST_PORT),
	username: process.env.DB_TEST_USER,
	password: process.env.DB_TEST_PASS,
	database: process.env.DB_TEST_NAME,
	entities,
	migrations: [migrationPath],
	dropSchema: true,
	logging: false,
	synchronize: true,
	migrationsRun: true,
});
