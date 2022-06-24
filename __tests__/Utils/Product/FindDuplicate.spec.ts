import User from '@models/User';
import Team from '@models/Team';

import { createStore } from '@utils/Stores/Create';
import { createProduct } from '@utils/Product/Create';

import AppError from '@errors/AppError';

import { isProductDuplicate } from '@utils/Product/FindDuplicate';
import connection from '../../Services/Database';
import { setup } from '../../setup';

describe('Check of duplicate product', () => {
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

    it('Should return false to check if exists duplicate', async () => {
        if (!team || !user) return;

        try {
            const result = await isProductDuplicate({
                name: 'product 01',
                team_id: team.id,
            });

            expect(result.isDuplicate).toBe(false);
        } catch (err) {
            console.log(err);
            expect(false).toBeTruthy();
        }
    });

    it('Should return true to check if exists duplicate', async () => {
        if (!team || !user) return;

        try {
            await createProduct({
                name: 'product duplicated',
                team_id: team.id,
                user_id: user.id,
            });

            const result = await isProductDuplicate({
                name: 'product duplicated',
                team_id: team.id,
            });

            expect(result.isDuplicate).toBe(true);
        } catch (err) {
            expect(false).toBeTruthy();
        }
    });

    it('should not check data if send invalid data', async () => {
        if (!team || !user) return;

        try {
            await isProductDuplicate({
                name: '',
                team_id: team.id,
            });

            expect(false).toBeTruthy();
        } catch (err) {
            expect(err).toBeInstanceOf(AppError);

            if (err instanceof AppError) {
                expect(err.statusCode).toBe(400);
            }
        }
    });

    it('Should return true to check if exists duplicate (by code)', async () => {
        if (!team || !user) return;

        try {
            const prod1 = await createProduct({
                name: 'product duplicated by code',
                team_id: team.id,
                user_id: user.id,
                code: '789654321',
            });

            const result = await isProductDuplicate({
                name: 'product duplicated (name diff from create)',
                team_id: team.id,
                code: '789654321',
            });

            expect(result.isDuplicate).toBe(true);
            expect(result.product_id).toBe(prod1.id);
        } catch (err) {
            expect(false).toBeTruthy();
        }
    });

    it('Should return true to check if exists duplicate (by code and store)', async () => {
        if (!team || !user) return;

        try {
            const store1 = await createStore({
                name: 'store 1',
                team_id: team.id,
                admin_id: user.id,
            });

            const prod1 = await createProduct({
                name: 'product duplicated by code',
                team_id: team.id,
                user_id: user.id,
                code: '789654321',
                store_id: store1.id,
            });

            const result = await isProductDuplicate({
                name: 'product duplicated (name diff from create)',
                team_id: team.id,
                code: '789654321',
                store_id: store1.id,
            });

            expect(result.isDuplicate).toBe(true);
            expect(result.product_id).toBe(prod1.id);
        } catch (err) {
            expect(false).toBeTruthy();
        }
    });

    it('Same product code but different stores should not return duplicate', async () => {
        if (!team || !user) return;

        try {
            const store1 = await createStore({
                name: 'store 1',
                team_id: team.id,
                admin_id: user.id,
            });

            const store2 = await createStore({
                name: 'store 2',
                team_id: team.id,
                admin_id: user.id,
            });

            await createProduct({
                name: 'product duplicated by code',
                team_id: team.id,
                user_id: user.id,
                code: '789654321',
                store_id: store1.id,
            });

            const result = await isProductDuplicate({
                name: 'product duplicated (name diff from create)',
                team_id: team.id,
                code: '789654321',
                store_id: store2.id,
            });

            expect(result.isDuplicate).toBe(false);
        } catch (err) {
            expect(false).toBeTruthy();
        }
    });

    it('Should return true to check if exists duplicate (by store)', async () => {
        if (!team || !user) return;

        try {
            const store1 = await createStore({
                name: 'store 1',
                team_id: team.id,
                admin_id: user.id,
            });

            const prod1 = await createProduct({
                name: 'product duplicated by code',
                team_id: team.id,
                user_id: user.id,
                store_id: store1.id,
            });

            const result = await isProductDuplicate({
                name: 'product duplicated by CODE', // <- UPPERCASE
                team_id: team.id,
                store_id: store1.id,
            });

            expect(result.isDuplicate).toBe(true);
            expect(result.product_id).toBe(prod1.id);
        } catch (err) {
            expect(false).toBeTruthy();
        }
    });

    it('Same product but different stores should not return duplicate', async () => {
        if (!team || !user) return;

        try {
            const store1 = await createStore({
                name: 'store 1',
                team_id: team.id,
                admin_id: user.id,
            });

            const store2 = await createStore({
                name: 'store 2',
                team_id: team.id,
                admin_id: user.id,
            });

            await createProduct({
                name: 'product duplicated by code',
                team_id: team.id,
                user_id: user.id,
                store_id: store1.id,
            });

            const result = await isProductDuplicate({
                name: 'product duplicated by code',
                team_id: team.id,
                store_id: store2.id,
            });

            expect(result.isDuplicate).toBe(false);
        } catch (err) {
            expect(false).toBeTruthy();
        }
    });
});
