import User from '@models/User';
import Team from '@models/Team';

import { createStore } from '@utils/Stores/Create';
import { createUser } from '@utils/User/Create';
import { addUserToTeam } from '@utils/Team/Roles/Create';

import AppError from '@errors/AppError';

import connection from '../../Services/Database';
import { setup } from '../../setup';

describe('Creation of store proccess', () => {
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

    it('should create a store', async () => {
        if (!team || !user) return;

        const store = await createStore({
            name: 'store 1',
            team_id: team.id,
            admin_id: user.id,
        });

        expect(store.id).not.toBe(undefined);
        expect(store.name).toBe('store 1');
        expect(store.team.id).toBe(team.id);
    });

    it('should not create a store without name', async () => {
        if (!team || !user) return;

        try {
            await createStore({
                name: '',
                team_id: team.id,
                admin_id: user.id,
            });

            expect(true).toBe(false);
        } catch (err) {
            expect(err).toBeInstanceOf(AppError);

            if (err instanceof AppError) {
                expect(err.statusCode).toBe(400);
            }
        }
    });

    it('should not create a store without a valid team uuid', async () => {
        if (!team || !user) return;

        try {
            await createStore({
                name: 'store 1',
                team_id: 'abc',
                admin_id: user.id,
            });

            expect(true).toBe(false);
        } catch (err) {
            expect(err).toBeInstanceOf(AppError);

            if (err instanceof AppError) {
                expect(err.statusCode).toBe(400);
            }
        }
    });

    it('should not create a store without a valid admin uuid', async () => {
        if (!team || !user) return;

        try {
            await createStore({
                name: 'store 1',
                team_id: team.id,
                admin_id: 'abc',
            });

            expect(true).toBe(false);
        } catch (err) {
            expect(err).toBeInstanceOf(AppError);

            if (err instanceof AppError) {
                expect(err.statusCode).toBe(400);
            }
        }
    });

    it('should only allow managers to create stores', async () => {
        if (!team || !user) return;

        const otherUser = await createUser({
            firebaseUid: '123asdasw',
            name: 'Not',
            lastName: 'Manager',
            email: 'not@manager.com',
        });

        await addUserToTeam({
            user_id: otherUser.id,
            team_id: team.id,
        });

        try {
            await createStore({
                name: 'store 1',
                team_id: team.id,
                admin_id: otherUser.id,
            });

            expect(false).toBeTruthy();
        } catch (err) {
            expect(err).toBeInstanceOf(AppError);

            if (err instanceof AppError) {
                expect(err.errorCode).toBe(35);
            }
        }
    });
});
