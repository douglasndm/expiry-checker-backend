import User from '@models/User';
import Team from '@models/Team';

import { getAllUsersFromTeamWithDevices } from '@utils/Team/Users';

import connection from '@tests/Services/Database';
import { setup } from '@tests/setup';

describe('Teste of users in a team', () => {
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

    it('should return users in a team with their devices', async () => {
        if (!team || !user) return;

        const users = await getAllUsersFromTeamWithDevices(team.id);

        expect(users).toHaveLength(1);
    });
});
