import { createUser } from '@utils/User/Create';
import { addUserToTeam } from '@utils/Team/Roles/Create';
import {
    getUserStoreOnTeam,
    removeUserFromAllStoresFromTeam,
} from '@utils/Stores/Team';

import Team from '@models/Team';
import User from '@models/User';

import AppError from '@errors/AppError';

import { createStore } from '@utils/Stores/Create';
import { addUserToStore } from '@utils/Stores/Users';
import connection from '~tests/Services/Database';
import { setup } from '~tests/setup';

describe('User stores on team process', () => {
    let user: User | null = null;
    let userTest: User | null = null;
    let team: Team | null = null;
    beforeAll(async () => {
        await connection.create();

        const init = await setup(2);

        user = init.user;
        team = init.team;

        userTest = await createUser({
            firebaseUid: '2354a',
            email: 'stores@tests.com',
        });

        await addUserToTeam({
            user_id: userTest.id,
            team_id: team.id,
        });
    });

    afterAll(async () => {
        await connection.close();
    });

    beforeEach(async () => {
        await connection.clear();
    });

    it('should return no stores for an user without store', async () => {
        if (!team || !userTest) return;

        try {
            const store = await getUserStoreOnTeam({
                team_id: team.id,
                user_id: userTest.id,
            });

            expect(store).toBe(undefined);
        } catch (err) {
            expect(false).toBeTruthy();
        }
    });

    it('should return the stores for user', async () => {
        if (!team || !user || !userTest) return;

        try {
            const createdStore = await createStore({
                name: 'store for tests',
                team_id: team.id,
                admin_id: user.id,
            });

            await addUserToStore({
                user_id: userTest.id,
                store_id: createdStore.id,
            });

            const store = await getUserStoreOnTeam({
                team_id: team.id,
                user_id: userTest.id,
            });

            expect(store?.store.id).toBe(createdStore.id);
            expect(store?.team_id).toBe(team.id);
        } catch (err) {
            expect(false).toBeTruthy();
        }
    });

    it('should not search stores with invalid team id', async () => {
        if (!team || !user || !userTest) return;

        try {
            await getUserStoreOnTeam({
                team_id: '|ASDÀPLSA-=asd185',
                user_id: userTest.id,
            });

            expect(false).toBeTruthy();
        } catch (err) {
            expect(err).toBeInstanceOf(AppError);

            if (err instanceof AppError) {
                expect(err.errorCode).toBe(1);
            }
        }
    });

    it('should not search stores with invalid user id', async () => {
        if (!team || !user || !userTest) return;

        try {
            await getUserStoreOnTeam({
                team_id: team.id,
                user_id: 'SAD489SAD@-ad',
            });

            expect(false).toBeTruthy();
        } catch (err) {
            expect(err).toBeInstanceOf(AppError);

            if (err instanceof AppError) {
                expect(err.errorCode).toBe(1);
            }
        }
    });

    it('should remove user from any stores from team', async () => {
        if (!team || !user || !userTest) return;

        try {
            const createdStore = await createStore({
                name: 'store for user be removed',
                team_id: team.id,
                admin_id: user.id,
            });

            await addUserToStore({
                user_id: userTest.id,
                store_id: createdStore.id,
            });

            await removeUserFromAllStoresFromTeam({
                user_id: userTest.id,
                team_id: team.id,
            });

            const store = await getUserStoreOnTeam({
                team_id: team.id,
                user_id: userTest.id,
            });

            expect(store).toBe(undefined);
        } catch (err) {
            expect(false).toBeTruthy();
        }
    });

    it('should not remove user with invalid user id', async () => {
        if (!team || !user || !userTest) return;

        try {
            await removeUserFromAllStoresFromTeam({
                user_id: 'ASD-ASD,2131',
                team_id: team.id,
            });
            expect(false).toBeTruthy();
        } catch (err) {
            expect(err).toBeInstanceOf(AppError);

            if (err instanceof AppError) {
                expect(err.errorCode).toBe(1);
            }
        }
    });

    it('should not remove user with invalid team id', async () => {
        if (!team || !user || !userTest) return;

        try {
            await removeUserFromAllStoresFromTeam({
                user_id: userTest.id,
                team_id: 'ASD-ASD,2131',
            });
            expect(false).toBeTruthy();
        } catch (err) {
            expect(err).toBeInstanceOf(AppError);

            if (err instanceof AppError) {
                expect(err.errorCode).toBe(1);
            }
        }
    });
});
