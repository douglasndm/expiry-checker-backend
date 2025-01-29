import User from '@models/User';
import Team from '@models/Team';

import { createUser } from '@utils/User/Create';
import { deleteBrand } from '@utils/Brands/Delete';
import { createBrand } from '@utils/Brand';
import { addUserToTeam } from '@utils/Team/Roles/Create';

import AppError from '@errors/AppError';

import connection from '../../Services/Database';
import { setup } from '../../setup';

describe('Delete of brand proccess', () => {
	let user: User | null = null;
	let team: Team | null = null;
	beforeAll(async () => {
		await connection.create();

		const init = await setup(2);

		user = init.user;
		team = init.team;
	});

	afterAll(async () => {
		await connection.close();
	});

	beforeEach(async () => {
		await connection.clear();
	});

	it('Should delete a brand', async () => {
		if (!team || !user) {
			return;
		}
		const brand = await createBrand({
			team_id: team.id,
			user_id: user.id,
			name: 'Nestle',
		});

		try {
			await deleteBrand({ brand_id: brand.id, user_id: user.id });
		} catch (err) {
			expect(true).toBe(false);
		}
	});

	it('Should not delete an invalid brand', async () => {
		if (!team || !user) {
			return;
		}

		try {
			await deleteBrand({
				brand_id: '8def712d-36b9-443e-bebe-07558380c392',
				user_id: user.id,
			});
			expect(true).toBe(false);
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);

			if (err instanceof AppError) {
				expect(err.errorCode).toBe(32);
			}
		}
	});

	it('should not delete a brand if user is not manager or supervisor', async () => {
		if (!team || !user) return;

		const newUser = await createUser({
			firebaseUid: 'user2',
			name: 'User',
			lastName: 'Two',
			email: 'two@user.com',
			password: '123456',
		});

		await addUserToTeam({
			user_id: newUser.id,
			team_id: team.id,
		});

		const brand = await createBrand({
			team_id: team.id,
			user_id: user.id,
			name: 'Pespisco',
		});

		try {
			await deleteBrand({
				brand_id: brand.id,
				user_id: newUser.id,
			});

			expect(true).toBe(false);
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);

			if (err instanceof AppError) {
				expect(err.errorCode).toBe(2);
			}
		}
	});
});
