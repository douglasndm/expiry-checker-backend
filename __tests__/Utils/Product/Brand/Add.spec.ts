import User from '@models/User';
import Team from '@models/Team';

import { createBrand } from '@utils/Brand';

import { createProduct } from '@utils/Product/Create';
import connection from '../../../Services/Database';
import { setup } from '../../../setup';

describe('Delete of brand proccess', () => {
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

	it('should create a product with a brand linked', async () => {
		if (!team || !user) {
			return;
		}
		const brand = await createBrand({
			team_id: team.id,
			user_id: user.id,
			name: 'Nestle',
		});

		try {
			await createProduct({
				name: 'Prod1',
				team_id: team.id,
				user_id: user.id,
				brand_id: brand.id,
			});
		} catch (err) {
			expect(true).toBe(false);
		}
	});
});
