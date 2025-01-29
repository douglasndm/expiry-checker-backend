import User from '@models/User';
import Team from '@models/Team';

import { createUser } from '@utils/User/Create';
import { createTeam } from '@utils/Team/Create';
import { createProduct } from '@utils/Product/Create';

import AppError from '@errors/AppError';

import connection from '../../Services/Database';

describe('Creation of a product', () => {
	let user: User | null = null;
	let team: Team | null = null;
	beforeAll(async () => {
		user = await createUser({
			firebaseUid: '123456789asd',
			name: 'Douglas',
			lastName: 'Mattos',
			email: 'mail@mail.com',
			password: '123456789',
		});

		team = await createTeam({
			name: 'Team 01',
			admin_id: '123456789asd',
		});
	});

	beforeEach(async () => {
		await connection.clear();
	});

	it('Should create a product', async () => {
		if (!team || !user) {
			return;
		}
		const product = await createProduct({
			name: 'Bread',
			code: '789123456',
			team_id: team.id,
			user_id: user.id,
		});

		expect(product.name).toBe('Bread');
		expect(product.code).toBe('789123456');
		expect(product.id).not.toBe(null);
	});

	it("Shouldn't create a duplicate product", async () => {
		if (!team || !user) {
			return;
		}

		await createProduct({
			name: 'Product 1',
			code: '123456789',
			team_id: team.id,
			user_id: user.id,
		});

		createProduct({
			name: 'Product 1',
			code: '123456789',
			team_id: team.id,
			user_id: user.id,
		}).catch(err => {
			expect(err).toBeInstanceOf(AppError);
			expect(err.errorCode).toBe(11);
		});
	});
});
