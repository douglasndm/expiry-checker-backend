import User from '@models/User';
import Team from '@models/Team';

import { createBrand, getAllBrands } from '@utils/Brand';

import AppError from '@errors/AppError';

import connection from '../../Services/Database';
import { setup } from '../../setup';

describe('List of brands proccess', () => {
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

    it('Should list all brands from a team', async () => {
        if (!team || !user) {
            return;
        }
        const brand1 = await createBrand({
            team_id: team.id,
            user_id: user.id,
            name: 'Nestle',
        });
        const brand2 = await createBrand({
            team_id: team.id,
            user_id: user.id,
            name: 'Lacta',
        });

        const brand3 = await createBrand({
            team_id: team.id,
            user_id: user.id,
            name: 'Coca Cola',
        });

        delete brand1.team;
        delete brand2.team;
        delete brand3.team;

        const allBrands = await getAllBrands({ team_id: team.id });

        expect(allBrands).toEqual(
            expect.arrayContaining([
                {
                    id: brand1.id,
                    name: brand1.name,
                },
                {
                    id: brand2.id,
                    name: brand2.name,
                },
                {
                    id: brand3.id,
                    name: brand3.name,
                },
            ]),
        );
    });
});
