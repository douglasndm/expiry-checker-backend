import { createProduct } from '@utils/Product/Create';
import { createBatch } from '@utils/Product/Batch/Create';

import Team from '@models/Team';
import User from '@models/User';

import AppError from '@errors/AppError';

import connection from '@tests/Services/Database';
import { setup } from '@tests/setup';

describe('Create of batch process', () => {
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

	it('should create a batch', async () => {
		if (!team || !user) return;

		try {
			const product = await createProduct({
				name: 'Bread',
				code: '789123456',
				team_id: team.id,
				user_id: user.id,
			});

			const exp_date = new Date();
			const batch = await createBatch({
				product_id: product.id,
				name: 'abc 123',
				exp_date,
				amount: 15,
				price: 3.99,
			});

			expect(batch.id).not.toBe(undefined);
			expect(batch.name).toBe('abc 123');
			expect(batch.exp_date).toBe(exp_date);
			expect(batch.amount).toBe(15);
			expect(batch.price).toBe(3.99);
		} catch (err) {
			expect(false).toBeTruthy();
		}
	});

	it('should not create a batch with invalid product uuid', async () => {
		if (!team || !user) return;

		try {
			const exp_date = new Date();
			await createBatch({
				product_id: '60c02b9a-0157-4720-bb31-bac939153e1a',
				name: 'abc 123',
				exp_date,
				amount: 15,
				price: 3.99,
			});

			expect(false).toBeTruthy();
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);

			if (err instanceof AppError) {
				expect(err.errorCode).toBe(8);
			}
		}
	});

	it('should not create a batch with invalid product id', async () => {
		if (!team || !user) return;

		try {
			const exp_date = new Date();
			await createBatch({
				product_id: 'basaco apsodk1',
				name: 'abc 123',
				exp_date,
				amount: 15,
				price: 3.99,
			});

			expect(false).toBeTruthy();
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);

			if (err instanceof AppError) {
				expect(err.errorCode).toBe(1);
			}
		}
	});

	it('should not create a batch with no name', async () => {
		if (!team || !user) return;

		try {
			const product = await createProduct({
				name: 'This product will throw an error',
				team_id: team.id,
				user_id: user.id,
			});

			const exp_date = new Date();
			await createBatch({
				product_id: product.id,
				name: '',
				exp_date,
				amount: 15,
				price: 3.99,
			});

			expect(false).toBeTruthy();
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);

			if (err instanceof AppError) {
				expect(err.errorCode).toBe(1);
			}
		}
	});
});
