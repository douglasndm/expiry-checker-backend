import { createBrand, updateBrand } from '@utils/Brand';
import { createUser } from '@utils/User/Create';
import { addUserToTeam } from '@utils/Team/Roles/Create';

import User from '@models/User';
import Team from '@models/Team';

import AppError from '@errors/AppError';

import connection from '@tests/Services/Database';
import { setup } from '@tests/setup';

describe('Update of brand proccess', () => {
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

	it('Should update a brand', async () => {
		if (!team || !user) return;

		const brand = await createBrand({
			team_id: team.id,
			user_id: user.id,
			name: 'Nestle',
		});

		const updatedBrand = await updateBrand({
			brand_id: brand.id,
			user_id: user.id,
			name: 'Lacta',
		});

		expect(updatedBrand.id).not.toBe(null);
		expect(updatedBrand.name).toBe('Lacta');
	});

	it('Should not update a brand with invalid id', async () => {
		if (!team || !user) return;

		try {
			await updateBrand({
				brand_id: '8def712d-36b9-443e-bebe-07558380c392',
				user_id: user.id,
				name: 'Lacta',
			});

			expect(true).toBe(false);
		} catch (error) {
			expect(error).toBeInstanceOf(AppError);
			if (error instanceof AppError) {
				expect(error.errorCode).toBe(32);
			}
		}
	});

	it('A repositor should not be able to update a brand', async () => {
		if (!team || !user) return;

		try {
			const brand = await createBrand({
				team_id: team.id,
				user_id: user.id,
				name: 'Garoto',
			});

			const repositor = await createUser({
				firebaseUid: '789test',
				name: 'Repositor',
				lastName: 'User',
				email: 'repositor@mail.com',
				password: '123456789',
			});

			await addUserToTeam({
				user_id: repositor.id,
				team_id: team.id,
			});

			await updateBrand({
				brand_id: brand.id,
				user_id: repositor.id,
				name: 'Lacta',
			});

			expect(true).toBe(false);
		} catch (error) {
			expect(error).toBeInstanceOf(AppError);
			if (error instanceof AppError) {
				expect(error.errorCode).toBe(2);
			}
		}
	});
});
