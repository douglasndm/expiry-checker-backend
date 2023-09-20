import User from '@models/User';
import Team from '@models/Team';

import { createStore } from '@utils/Stores/Create';
import { createProduct } from '@utils/Product/Create';
import { createUser } from '@utils/User/Create';
import { addUserToTeam } from '@utils/Team/Roles/Create';
import { addUserToStore } from '@utils/Stores/Users';

import AppError from '@errors/AppError';

import connection from '../../../Services/Database';
import { setup } from '../../../setup';

describe('Creation of a product with store', () => {
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

    it('Should create a product with store', async () => {
        if (!team || !user) {
            return;
        }
        const store = await createStore({
            name: 'store 1',
            team_id: team.id,
            admin_id: user.id,
        });

        const product = await createProduct({
            name: 'product with store',
            team_id: team.id,
            user_id: user.id,
            store_id: store.id,
        });

        expect(product.id).not.toBe(null);
        expect(product.name).toBe('product with store');
        expect(product.store?.id).toBe(store.id);
    });

    it('Should create a product with invalid store', async () => {
        if (!team || !user) return;

        try {
            await createProduct({
                name: 'product with store 2',
                team_id: team.id,
                user_id: user.id,
                store_id: 'b0457935-0b71-45a7-969a-e8ca0000986b',
            });

            expect(false).toBeTruthy();
        } catch (err) {
            expect(err).toBeInstanceOf(AppError);

            if (err instanceof AppError) {
                expect(err.errorCode).toBe(37);
            }
        }
    });

    it('Auto fill user store if they are not managers or do not submit the store id', async () => {
        if (!team || !user) return;

        try {
            const notManager = await createUser({
                firebaseUid: 'User test',
                email: 'not@manager.com',
            });

            const store = await createStore({
                name: 'store 2',
                team_id: team.id,
                admin_id: user.id,
            });

            await addUserToTeam({
                user_id: notManager.id,
                team_id: team.id,
            });

            await addUserToStore({
                user_id: notManager.id,
                store_id: store.id,
            });

            const product = await createProduct({
                name: 'product with store no id',
                team_id: team.id,
                user_id: notManager.id,
            });

            expect(product.id).not.toBe(null);
            expect(product.name).toBe('product with store no id');
            expect(product.store?.id).toBe(store.id);
        } catch (err) {
            expect(false).toBeTruthy();
        }
    });
});
