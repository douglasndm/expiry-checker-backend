import User from '@models/User';
import Team from '@models/Team';
import Product from '@models/Product';

import { createProduct } from '@utils/Product/Create';
import { createBatch } from '@utils/Product/Batch/Create';
import { updateBatch } from '@utils/Product/Batch/Update';

import AppError from '@errors/AppError';

import connection from '~tests/Services/Database';
import { setup } from '~tests/setup';

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

    it('should update a batch name', async () => {
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

            const updatedBatch = await updateBatch({
                batch_id: batch.id,
                name: 'new name',
            });

            expect(updatedBatch.name).toBe('new name');
            expect(batch.exp_date).toBe(exp_date);
            expect(batch.amount).toBe(15);
            expect(batch.price).toBe(3.99);
        } catch (err) {
            expect(false).toBeTruthy();
        }
    });
});
