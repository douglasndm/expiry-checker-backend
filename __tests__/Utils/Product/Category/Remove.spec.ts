import User from '@models/User';
import Team from '@models/Team';

import { createProduct } from '@utils/Product/Create';
import { getProductById } from '@utils/Product/Get';
import { createCategory } from '@utils/Categories/Create';

import AppError from '@errors/AppError';

import connection from '@tests/Services/Database';
import { setup } from '@tests/setup';
import { deleteCategory } from '@utils/Categories/Delete';

describe('Remove a category from product', () => {
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

	it('it should remove a category from a product', async () => {
		if (!team || !user) return;

		const category = await createCategory({
			team_id: team.id,
			name: 'Food',
		});

		const product = await createProduct({
			name: 'Prod1',
			team_id: team.id,
			user_id: user.id,
			category_id: category.id,
		});

		expect(product.category).toBeUndefined();

		await removeCategoryFromProduct(product.id);
		const product2 = await getProductById({
			product_id: product.id,
			includeCategory: true,
		});

		expect(product2.category).toBeNull();
	});

	it('should not remove a category from a product with invalid product uuid', async () => {
		if (!team || !user) return;

		try {
			await removeCategoryFromProduct(
				'60c02b9a-0157-4720-bb31-bac939154e1a'
			);
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);

			if (err instanceof AppError) {
				expect(err.errorCode).toBe(8);
			}
		}
	});

	it('should not remove a category from a product with invalid product id', async () => {
		if (!team || !user) return;

		try {
			await removeCategoryFromProduct('asd asd1da ');
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);

			if (err instanceof AppError) {
				expect(err.errorCode).toBe(1);
			}
		}
	});

	it('should remove a category from a product when the category is deleted', async () => {
		if (!team || !user) return;

		const category = await createCategory({
			team_id: team.id,
			name: 'Drinks',
		});

		const product = await createProduct({
			name: 'Prod1',
			team_id: team.id,
			user_id: user.id,
			category_id: category.id,
		});

		expect(product.category).toBeUndefined();

		await deleteCategory({ category_id: category.id });

		const updatedProduct = await getProductById({
			product_id: product.id,
			includeCategory: true,
		});

		expect(updatedProduct.category).toBeNull();
	});
});
