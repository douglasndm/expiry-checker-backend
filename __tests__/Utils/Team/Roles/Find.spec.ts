import { getUserRole } from '@utils/Team/Roles/Find';

import Team from '@models/Team';
import User from '@models/User';

import AppError from '@errors/AppError';
import connection from '../../../Services/Database';
import { setup } from '../../../setup';

describe('Find user role proccess', () => {
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

    it('should find the user role', async () => {
        if (!team || !user) return;

        const role = await getUserRole({ user_id: user.id, team_id: team.id });

        expect(role.role.toLowerCase()).toBe('manager');
        expect(role.code).toBe(null);
    });

    it('should not find the user role for invalid user', async () => {
        if (!team) return;

        try {
            await getUserRole({
                user_id: '33714a2a-80b5-4bee-8383-c090636f303f',
                team_id: team.id,
            });

            expect(true).toBe(false);
        } catch (err) {
            expect(err).toBeInstanceOf(AppError);
            if (err instanceof AppError) {
                expect(err.errorCode).toBe(17);
            }
        }
    });
});
