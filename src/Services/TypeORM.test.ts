import { DataSource } from 'typeorm';

export const testDataSource = new DataSource({
	name: 'test',
	type: 'postgres',
	host: process.env.DB_TEST_HOST,
	port: Number(process.env.DB_TEST_PORT),
	username: process.env.DB_TEST_USER,
	password: process.env.DB_TEST_PASS,
	database: process.env.DB_TEST_NAME,
	entities: [`${__dirname}/../App/Models/*.ts`],
	migrations: ['/src/Services/Database/Typeorm/migrations/*.ts'],
	dropSchema: true,
	logging: false,
	synchronize: true,
	migrationsRun: true,
});
