import User from '@models/User';
import Team from '@models/Team';

import { createUser } from '@utils/User/Create';
import { createTeam } from '@utils/Team/Create';

import AppError from '@errors/AppError';

import { createCategory } from '@utils/Categories/Create';
import connection from '../../Services/Database';

describe('Creation of category proccess', () => {
    let user: User | null = null;
    let team: Team | null = null;
    beforeAll(async () => {
        await connection.create();

        user = await createUser({
            firebaseUid: '123456789asd',
            name: 'Douglas',
            lastName: 'Mattos',
            email: 'mail@mail.com',
            password: '123456789',
        });

        team = await createTeam({
            name: 'Team 01',
            admin_id: '123456789asd',
        });
    });

    afterAll(async () => {
        await connection.close();
    });

    beforeEach(async () => {
        await connection.clear();
    });

    it('Should create a category', async () => {
        if (!team || !user) {
            return;
        }
        const category = await createCategory({
            team_id: team.id,
            name: 'Food',
        });

        expect(category.id).not.toBe(null);
        expect(category.name).toBe('Food');
        expect(category.team.id).toBe(team.id);
    });

    it("Shouldn't create a duplicate category", async () => {
        if (!team || !user) {
            return;
        }

        await createCategory({
            team_id: team.id,
            name: 'Drink',
        });

        createCategory({
            team_id: team.id,
            name: 'drink',
        }).catch(err => {
            expect(err).toBeInstanceOf(AppError);
            expect(err.errorCode).toBe(13);
        });
    });
});
