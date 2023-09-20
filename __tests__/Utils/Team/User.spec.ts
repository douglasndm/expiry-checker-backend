import User from '@models/User';
import Team from '@models/Team';

import { createUser } from '@utils/User/Create';
import { checkIfUserIsOnTeam } from '@utils/Team/Users';

import connection from '../../Services/Database';
import { setup } from '../../setup';

describe('Test of user in a team', () => {
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

    it('should add user inside the team and return as true', async () => {
        if (!team || !user) return;

        const isOnTeam = await checkIfUserIsOnTeam({
            user_id: user.id,
            team_id: team.id,
        });

        expect(isOnTeam).toBe(true);
    });

    it('should return false since user is not on team', async () => {
        if (!team) return;

        const secondUser = await createUser({
            firebaseUid: 'user2',
            name: 'User',
            lastName: 'Two',
            email: 'two@user.com',
            password: '123456',
        });

        const isOnTeam = await checkIfUserIsOnTeam({
            user_id: secondUser.id,
            team_id: team.id,
        });

        expect(isOnTeam).toBe(false);
    });
});
