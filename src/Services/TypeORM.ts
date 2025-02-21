import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

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
	entities: [`${__dirname}/../App/Models/*.ts`],
	migrations: [migrationPath],
	synchronize: false,
	logging: false,
});
