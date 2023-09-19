import { createProduct } from '@utils/Product/Create';
import { createBatch } from '@utils/Product/Batch/Create';
import { deleteBatch } from '@utils/Product/Batch/Delete';
import { deleteProduct } from '@utils/Product/Delete';
import { findBatchById } from '@utils/Product/Batch/Find';

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

    it('Should not delete a batch with invalid id', async () => {
        if (!team || !user || !product) return;

        try {
            await deleteBatch('60c02b9a-0157-4720-bb31-bac939154e1a');
            expect(true).toBe(false);
        } catch (err) {
            expect(err).toBeInstanceOf(AppError);
            if (err instanceof AppError) {
                expect(err.errorCode).toBe(9);
            }
        }
    });

    it('should delete a batch on delete of product', async () => {
        if (!team || !user || !product) return;

        const batch = await createBatch({
            product_id: product.id,
            name: 'ABCXYZ',
            exp_date: new Date(),
            amount: 10,
            price: 8.99,
        });

        try {
            await deleteProduct({ product_id: product.id });

            await findBatchById(batch.id);

            expect(true).toBe(false);
        } catch (err) {
            expect(err).toBeInstanceOf(AppError);

            if (err instanceof AppError) {
                expect(err.errorCode).toBe(9);
            }
        }
    });
});
