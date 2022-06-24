import { compareAsc } from 'date-fns';

import { createProduct } from '@utils/Product/Create';
import { createBatch } from '@utils/Product/Batch/Create';

import Team from '@models/Team';
import User from '@models/User';

import AppError from '@errors/AppError';

import { findBatchById } from '@utils/Product/Batch/Find';
import connection from '~tests/Services/Database';
import { setup } from '~tests/setup';

describe('Find a batch process', () => {
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

    it('should find a batch', async () => {
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

            const findedBatch = await findBatchById(batch.id);
            const findedPrice = parseFloat(
                String(findedBatch.price).substring(1),
            );

            expect(findedBatch.id).not.toBe(undefined);
            expect(findedBatch.name).toBe('abc 123');
            expect(findedBatch.amount).toBe(15);
            expect(findedPrice).toBe(3.99);
            expect(compareAsc(findedBatch.exp_date, exp_date)).toBe(0);
        } catch (err) {
            expect(false).toBeTruthy();
        }
    });

    it('should not find a batch with invalid id', async () => {
        if (!team || !user) return;

        try {
            await findBatchById('ABC askx 12');

            expect(false).toBeTruthy();
        } catch (err) {
            expect(err).toBeInstanceOf(AppError);

            if (err instanceof AppError) {
                expect(err.errorCode).toBe(1);
            }
        }
    });

    it('should not find a batch with not existent uuid', async () => {
        if (!team || !user) return;

        try {
            await findBatchById('60c02b9a-0157-4720-bb31-bac939153e1a');

            expect(false).toBeTruthy();
        } catch (err) {
            expect(err).toBeInstanceOf(AppError);

            if (err instanceof AppError) {
                expect(err.errorCode).toBe(9);
            }
        }
    });
});
