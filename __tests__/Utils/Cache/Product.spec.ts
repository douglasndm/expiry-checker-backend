import User from '@models/User';
import Team from '@models/Team';

import { createStore } from '@utils/Stores/Create';
import { createProduct } from '@utils/Product/Create';
import { createCategory } from '@utils/Categories/Create';
import { createBrand } from '@utils/Brand';
import { clearProductCache } from '@utils/Cache/Product';

import connection from '@tests/Services/Database';
import { setup } from '@tests/setup';

describe('Clear product cache process', () => {
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

	it('Should clear product cache and its brand, category and store', async () => {
		if (!team || !user) return;

		const store = await createStore({
			name: 'store 1',
			team_id: team.id,
			admin_id: user.id,
		});

		const category = await createCategory({
			team_id: team.id,
			name: 'Food',
		});

		const brand = await createBrand({
			team_id: team.id,
			name: 'Nestle',
			user_id: user.id,
		});

		const product = await createProduct({
			name: 'Prod1',
			team_id: team.id,
			user_id: user.id,
			brand_id: brand.id,
			category_id: category.id,
			store_id: store.id,
		});

		try {
			await clearProductCache(product.id);
		} catch (err) {
			expect(true).toBe(false);
		}
	});
});
