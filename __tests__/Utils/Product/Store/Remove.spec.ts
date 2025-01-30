import User from '@models/User';
import Team from '@models/Team';

import { createProduct } from '@utils/Product/Create';
import { getProductById } from '@utils/Product/Get';
import { removeStoreFromProduct } from '@utils/Product/Store/Remove';
import { createStore } from '@utils/Stores/Create';
import { deleteStore } from '@utils/Stores/Delete';

import AppError from '@errors/AppError';

import connection from '@tests/Services/Database';
import { setup } from '@tests/setup';

describe('Remove a store from product', () => {
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

	it('it should remove a store from a product', async () => {
		if (!team || !user) return;

		const store = await createStore({
			team_id: team.id,
			name: 'Main store',
			admin_id: user.id,
		});

		const product = await createProduct({
			name: 'Prod1',
			team_id: team.id,
			user_id: user.id,
			store_id: store.id,
		});

		expect(product.store?.id).toBe(store.id);
		expect(product.store?.name).toBe(store.name);

		await removeStoreFromProduct(product.id);
		const product2 = await getProductById({
			product_id: product.id,
			includeStore: true,
		});

		expect(product2.store).toBeNull();
	});

	it('should not remove a store from a product with invalid product uuid', async () => {
		if (!team || !user) return;

		try {
			await removeStoreFromProduct(
				'60c02b9a-0157-4720-bb31-bac939154e1a'
			);
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);

			if (err instanceof AppError) {
				expect(err.errorCode).toBe(8);
			}
		}
	});

	it('should not remove a store from a product with invalid product id', async () => {
		if (!team || !user) return;

		try {
			await removeStoreFromProduct('asd asd1da ');
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);

			if (err instanceof AppError) {
				expect(err.errorCode).toBe(1);
			}
		}
	});

	it('should delete a product when its store is deleted', async () => {
		if (!team || !user) return;

		const store = await createStore({
			team_id: team.id,
			name: 'Store 2',
			admin_id: user.id,
		});

		const product = await createProduct({
			name: 'Prod1',
			team_id: team.id,
			user_id: user.id,
			store_id: store.id,
		});

		expect(product.store?.id).toBe(store.id);
		expect(product.store?.name).toBe(store.name);

		await deleteStore({
			store_id: store.id,
			team_id: team.id,
			admin_id: user.id,
		});

		try {
			const updatedProduct = await getProductById({
				product_id: product.id,
				includeStore: true,
			});

			expect(true).toBe(false);
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);

			if (err instanceof AppError) {
				expect(err.errorCode).toBe(8);
			}
		}
	});
});
