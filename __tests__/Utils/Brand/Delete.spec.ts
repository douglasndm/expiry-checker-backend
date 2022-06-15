import User from '@models/User';
import Team from '@models/Team';

import { createBrand, deleteBrand } from '@utils/Brand';

import AppError from '@errors/AppError';

import connection from '../../Services/Database';
import { setup } from '../../setup';

describe('Delete of brand proccess', () => {
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

    it('Should delete a brand', async () => {
        if (!team || !user) {
            return;
        }
        const brand = await createBrand({
            team_id: team.id,
            user_id: user.id,
            name: 'Nestle',
        });

        try {
            await deleteBrand({ brand_id: brand.id, user_id: user.id });
        } catch (err) {
            expect(true).toBe(false);
        }
    });

    it('Should not delete an invalid brand', async () => {
        if (!team || !user) {
            return;
        }

        try {
            await deleteBrand({
                brand_id: '8def712d-36b9-443e-bebe-07558380c392',
                user_id: user.id,
            });
            expect(true).toBe(false);
        } catch (err) {
            expect(err).toBeInstanceOf(AppError);

            if (err instanceof AppError) {
                expect(err.errorCode).toBe(32);
            }
        }
    });
});
