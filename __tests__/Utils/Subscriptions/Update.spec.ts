import { addDays, startOfDay } from 'date-fns';

import User from '@models/User';
import Team from '@models/Team';

import { setTeamSubscription } from '@utils/Subscriptions/Update';

import AppError from '@errors/AppError';

import connection from '@tests/Services/Database';
import { setup } from '@tests/setup';

describe('Update of a subscription process', () => {
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

    it('should set a new subscription for a team', async () => {
        if (!team || user) return;

        const subscription: RevenueCatSubscription = {
            expires_date: addDays(new Date(), 30).toISOString(),
            purchase_date: new Date().toISOString(),
            store: 'play_store',
            unsubscribe_detected_at: null,
        };

        const teamSubscription = await setTeamSubscription({
            team_id: team.id,
            subscription,
            members: 20,
        });

        expect(teamSubscription.membersLimit).toBe(20);
        expect(teamSubscription.expireIn).toBe(
            startOfDay(addDays(new Date(), 30)),
        );
    });
});
