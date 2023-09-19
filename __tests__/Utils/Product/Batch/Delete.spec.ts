import { createProduct } from '@utils/Product/Create';
import { createBatch } from '@utils/Product/Batch/Create';
import { deleteBatch } from '@utils/Product/Batch/Delete';

import Team from '@models/Team';
import User from '@models/User';
import Product from '@models/Product';

import AppError from '@errors/AppError';

import connection from '@tests/Services/Database';
import { setup } from '@tests/setup';

describe('Create of batch process', () => {
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

    it('Should delete a batch', async () => {
        if (!team || !user || !product) return;

        const batch = await createBatch({
            product_id: product.id,
            name: 'ABCXYZ',
            exp_date: new Date(),
            amount: 10,
            price: 8.99,
        });

        try {
            await deleteBatch(batch.id);
        } catch (err) {
            expect(true).toBe(false);
        }
    });
});
