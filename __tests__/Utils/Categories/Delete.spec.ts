import { createCategory } from '@utils/Categories/Create';
import { deleteCategory } from '@utils/Categories/Delete';

import Team from '@models/Team';

import AppError from '@errors/AppError';

import connection from '../../Services/Database';
import { setup } from '../../setup';

describe('Delete of category process', () => {
	let team: Team | null = null;
	beforeAll(async () => {
		const init = await setup(2);

		team = init.team;
	});

	beforeEach(async () => {
		await connection.clear();
	});

	it('should delete a category', async () => {
		if (!team) return;

		const category = await createCategory({
			team_id: team.id,
			name: 'food',
		});

		try {
			await deleteCategory({
				category_id: category.id,
			});
		} catch (err) {
			expect(true).toBe(false);
		}
	});

	it('should not delete an invalid category', async () => {
		try {
			await deleteCategory({
				category_id: '3a9eed9a-4171-47d9-9ced-233838836bf7',
			});
			expect(true).toBe(false);
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);
			if (err instanceof AppError) {
				expect(err.statusCode).toBe(400);
				expect(err.errorCode).toBe(10);
			}
		}
	});
});
