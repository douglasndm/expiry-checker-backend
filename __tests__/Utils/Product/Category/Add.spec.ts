import User from '@models/User';
import Team from '@models/Team';

import { createProduct } from '@utils/Product/Create';
import { createCategory } from '@utils/Categories/Create';

import AppError from '@errors/AppError';

import connection from '../../../Services/Database';
import { setup } from '../../../setup';

describe('Add product to a category', () => {
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

	it('should add a product in a category', async () => {
		if (!team || !user) return;

		const product = await createProduct({
			name: 'product',
			team_id: team.id,
			user_id: user.id,
		});

		const category = await createCategory({
			team_id: team.id,
			name: 'category 1',
		});

		try {
			await addToCategory({
				product_id: product.id,
				category_id: category.id,
			});

			expect(true).toBeTruthy();
		} catch (err) {
			expect(true).toBe(false);
		}
	});

	it('should not add a product in an invalid category', async () => {
		if (!team || !user) return;

		const product = await createProduct({
			name: 'product 2',
			team_id: team.id,
			user_id: user.id,
		});

		try {
			await addToCategory({
				product_id: product.id,
				category_id: '8de65923-c4c7-4524-b9c5-edb5623daf50',
			});

			expect(true).toBe(false);
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);

			if (err instanceof AppError) {
				expect(err.statusCode).toBe(400);
			}
		}
	});

	it('should not accept product/category with invalid uuid', async () => {
		if (!team || !user) return;

		try {
			await addToCategory({
				product_id: 'abc',
				category_id: 'xtz',
			});

			expect(true).toBe(false);
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);

			if (err instanceof AppError) {
				expect(err.statusCode).toBe(400);
			}
		}
	});

	it('should not add a product in a category that is already in', async () => {
		if (!team || !user) return;

		const product = await createProduct({
			name: 'duplicate product',
			team_id: team.id,
			user_id: user.id,
		});

		const category = await createCategory({
			team_id: team.id,
			name: 'category 2',
		});

		try {
			await addToCategory({
				product_id: product.id,
				category_id: category.id,
			});

			await addToCategory({
				product_id: product.id,
				category_id: category.id,
			});

			expect(true).toBe(false);
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);

			if (err instanceof AppError) {
				expect(err.statusCode).toBe(400);
			}
		}
	});
});
