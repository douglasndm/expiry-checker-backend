import { createCategory } from '@utils/Categories/Create';
import { getAllCategoriesFromTeam } from '@utils/Categories/List';

import Team from '@models/Team';

import connection from '../../Services/Database';
import { setup } from '../../setup';

describe('Listing of category proccess', () => {
	let team: Team | null = null;
	beforeAll(async () => {
		await connection.create();

		const init = await setup(2);

		team = init.team;
	});

	afterAll(async () => {
		await connection.close();
	});

	beforeEach(async () => {
		await connection.clear();
	});

	it("Should list team's categories", async () => {
		if (!team) {
			return;
		}

		const cate1 = await createCategory({
			team_id: team.id,
			name: 'Food',
		});
		const cate2 = await createCategory({
			team_id: team.id,
			name: 'drink',
		});

		const categories = await getAllCategoriesFromTeam({ team_id: team.id });

		expect(categories).toEqual(
			expect.arrayContaining([
				{
					id: cate1.id,
					name: cate1.name,
				},
				{
					id: cate2.id,
					name: cate2.name,
				},
			])
		);
	});
});
