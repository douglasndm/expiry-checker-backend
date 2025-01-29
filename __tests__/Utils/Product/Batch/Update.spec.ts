import { addDays } from 'date-fns';

import User from '@models/User';
import Team from '@models/Team';
import Product from '@models/Product';

import { createProduct } from '@utils/Product/Create';
import { createBatch } from '@utils/Product/Batch/Create';
import { updateBatch } from '@utils/Product/Batch/Update';

import AppError from '@errors/AppError';

import connection from '@tests/Services/Database';
import { setup } from '@tests/setup';

describe('Update of a batch process', () => {
	let user: User | null = null;
	let team: Team | null = null;
	let product: Product | null = null;
	beforeAll(async () => {
		await connection.create();

		const init = await setup(2);

		user = init.user;
		team = init.team;

		product = await createProduct({
			name: 'Bread',
			code: '789123456',
			team_id: team.id,
			user_id: user.id,
		});
	});

	afterAll(async () => {
		await connection.close();
	});

	beforeEach(async () => {
		await connection.clear();
	});

	it('should update a batch', async () => {
		if (!team || !user || !product) return;

		try {
			const exp_date = new Date();
			const batch = await createBatch({
				product_id: product.id,
				name: 'abc 123',
				exp_date,
				amount: 15,
				price: 3.99,
			});

			const newDate = addDays(batch.exp_date, 7);

			const updatedBatch = await updateBatch({
				batch_id: batch.id,
				name: 'new name',
				exp_date: newDate,
				amount: 30,
				price: 1.99,
				price_tmp: 1.49,
				status: 'checked',
			});

			expect(updatedBatch.name).toBe('new name');
			expect(updatedBatch.exp_date).toBe(newDate);
			expect(updatedBatch.amount).toBe(30);
			expect(updatedBatch.price).toBe(1.99);
			expect(updatedBatch.status).toBe('checked');
		} catch (err) {
			expect(false).toBeTruthy();
		}
	});

	it('should not update a batch with invalid batch id', async () => {
		if (!team || !user || !product) return;

		try {
			await updateBatch({
				batch_id: 'ASODpka-12as4c8',
				name: 'new name',
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
