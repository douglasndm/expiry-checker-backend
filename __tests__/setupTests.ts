import dotenv from 'dotenv';

import { testDataSource } from '@services/TypeORM.test';

jest.mock('@services/TypeORM', () => ({
	__esModule: true,
	defaultDataSource: testDataSource,
}));

beforeAll(async () => {
	dotenv.config();
});
