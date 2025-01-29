import User from '@models/User';
import Team from '@models/Team';

import { createCategory } from '@utils/Categories/Create';

import AppError from '@errors/AppError';

import connection from '../../Services/Database';
import { setup } from '../../setup';

describe('Creation of category proccess', () => {
	let user: User | null = null;
	let team: Team | null = null;
	beforeAll(async () => {
		const init = await setup(2);

		user = init.user;
		team = init.team;
	});

	beforeEach(async () => {
		await connection.clear();
	});

	it('Should create a category', async () => {
		if (!team || !user) {
			return;
		}
		const category = await createCategory({
			team_id: team.id,
			name: 'Food',
		});

		expect(category.id).not.toBe(null);
		expect(category.name).toBe('Food');
		expect(category.team.id).toBe(team.id);
	});

	it("Shouldn't create a duplicate category", async () => {
		if (!team || !user) {
			return;
		}

		await createCategory({
			team_id: team.id,
			name: 'Drink',
		});

		try {
			await createCategory({
				team_id: team.id,
				name: 'drink',
			});

			expect(true).toBe(false);
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);
			if (err instanceof AppError) {
				expect(err.statusCode).toBe(400);
				expect(err.errorCode).toBe(13);
			}
		}
	});
});
