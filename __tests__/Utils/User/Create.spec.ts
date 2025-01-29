import { createUser } from '@utils/User/Create';

import { setup } from '@tests/setup';

import connection from '../../Services/Database';

beforeAll(async () => {
	await setup();
});

beforeEach(async () => {
	await connection.clear();
});

describe('Create user process', () => {
	it('should create an user', async () => {
		const createdUser = await createUser({
			firebaseUid: '123456789asd',
			name: 'Douglas',
			lastName: 'Mattos',
			email: 'mail@mail.com',
			password: '123456789',
		});

		expect(createdUser.id).not.toBe(null);
	});
});
