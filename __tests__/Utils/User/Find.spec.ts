import User from '@models/User';

import {
	getUserByFirebaseId,
	getUserById,
	getUserByEmail,
} from '@utils/User/Find';

import AppError from '@errors/AppError';

import { createUser } from '@utils/User/Create';
import connection from '@tests/Services/Database';
import { setup } from '@tests/setup';

describe('Find user process', () => {
	let user: User | null = null;

	beforeAll(async () => {
		const init = await setup(2);

		user = init.user;
	});

	beforeEach(async () => {
		await connection.clear();
	});

	it('should find an user by firebase id', async () => {
		if (!user) return;
		const findedUser = await getUserByFirebaseId(user.firebaseUid);

		expect(findedUser).not.toBe(null);
		expect(findedUser.name).toBe('Douglas');
	});

	it('should find an user by id', async () => {
		if (!user) return;

		const userById = await getUserById(user.id);

		expect(userById).not.toBe(null);
		expect(userById.id).toBe(user.id);
	});

	it('should find an user by email', async () => {
		if (!user) return;

		const findedUser = await getUserByEmail(user.email);

		expect(findedUser).not.toBe(null);
		expect(findedUser.name).toBe('Douglas');
	});

	it('should find an user by email by case insentive', async () => {
		await createUser({
			firebaseUid: 'terst123',
			email: 'CaseInsentive@mail.com',
		});

		const findedUser = await getUserByEmail('caseinsentive@mail.com');

		expect(findedUser).not.toBe(null);
		expect(findedUser.email).toBe('CaseInsentive@mail.com');
	});

	// EXPECT ERRORS
	it('should NOT find an user by invalid firebase id', async () => {
		try {
			await getUserByFirebaseId('123');
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);
			if (err instanceof AppError) {
				expect(err.errorCode).toBe(7);
			}
		}
	});

	it('should NOT find an user by not existent id', async () => {
		try {
			await getUserById('08792baf-8264-4b1e-bd09-af922815e803');
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);
			if (err instanceof AppError) {
				expect(err.errorCode).toBe(7);
			}
		}
	});

	it('should NOT find an user by not existents email', async () => {
		try {
			await getUserByEmail('invalid@mail.com');
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);
			if (err instanceof AppError) {
				expect(err.errorCode).toBe(7);
			}
		}
	});
});
