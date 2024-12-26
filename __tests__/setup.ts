import { addDays } from 'date-fns';

import { testDataSource } from '@services/TypeORM';

import { createUser } from '@utils/User/Create';
import { createTeam } from '@utils/Team/Create';

import User from '@models/User';
import Team from '@models/Team';
import TeamSubscription from '@models/TeamSubscription';

interface setupResponse {
    user: User;
    team: Team;
}

async function setup(teamMembersLimit?: number): Promise<setupResponse> {
    const user = await createUser({
        firebaseUid: '123456789asd',
        name: 'Douglas',
        lastName: 'Mattos',
        email: 'mail@mail.com',
        password: '123456789',
    });

    const team = await createTeam({
        name: 'Team 01',
        admin_id: '123456789asd',
    });

    const teamSubRepository = testDataSource.getRepository(TeamSubscription);
    const teamSub = new TeamSubscription();
    teamSub.team = team;
    teamSub.membersLimit = teamMembersLimit || 10;
    teamSub.expireIn = addDays(new Date(), 7);
    teamSub.isActive = true;

    await teamSubRepository.save(teamSub);

    return {
        user,
        team,
    };
}

export { setup };
