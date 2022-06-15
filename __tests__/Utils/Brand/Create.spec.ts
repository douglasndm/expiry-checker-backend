import User from '@models/User';
import Team from '@models/Team';

import { createBrand } from '@utils/Brand';

import AppError from '@errors/AppError';

import connection from '../../Services/Database';
import { setup } from '../../setup';

describe('Creation of brand proccess', () => {
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

    it('Should create a brand', async () => {
        if (!team || !user) {
            return;
        }
        const brand = await createBrand({
            team_id: team.id,
            user_id: user.id,
            name: 'Nestle',
        });

        expect(brand.id).not.toBe(null);
        expect(brand.name).toBe('Nestle');

        if (brand.team) {
            expect(brand.team.id).toBe(team.id);
        }
    });

    it('Should nout create a duplicate brand', async () => {
        if (!team || !user) {
            return;
        }

        await createBrand({
            team_id: team.id,
            user_id: user.id,
            name: 'Lacta',
        });

        try {
            await createBrand({
                team_id: team.id,
                user_id: user.id,
                name: 'lacta',
            });
            expect(true).toBe(false);
        } catch (err) {
            expect(err).toBeInstanceOf(AppError);

            if (err instanceof AppError) {
                expect(err.errorCode).toBe(31);
            }
        }
    });
});
