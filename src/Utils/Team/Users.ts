import { defaultDataSource } from '@services/TypeORM';

import User from '@models/User';

import { getAllUsersFromTeam } from '@functions/Team/Users';

interface checkIfUserIsOnTeamProps {
    user_id: string;
    team_id: string;
}

async function checkIfUserIsOnTeam({
    user_id,
    team_id,
}: checkIfUserIsOnTeamProps): Promise<boolean> {
    const usersOnTeam = await getAllUsersFromTeam({
        team_id,
    });

    const isOnTeam = usersOnTeam.find(user => user.id === user_id);

    if (isOnTeam) return true;
    return false;
}

// user devices has the token to send a notification for user
// so this is used to send a notification for a team
async function getAllUsersFromTeamWithDevices(
    team_id: string,
): Promise<User[]> {
    const userRepository = defaultDataSource.getRepository(User);

    const users = await userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .leftJoinAndSelect('user.login', 'login')
        .leftJoinAndSelect('role.team', 'team')
        .where('team.id = :team_id', { team_id })
        .getMany();

    return users;
}

export { checkIfUserIsOnTeam, getAllUsersFromTeamWithDevices };
