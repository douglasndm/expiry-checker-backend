import { getRepository } from 'typeorm';

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

interface getAllUsersFromTeamWithDevices {
    team_id: string;
}

async function getAllUsersFromTeamWithDevices({
    team_id,
}: getAllUsersFromTeamWithDevices): Promise<User[]> {
    const userRepository = getRepository(User);

    const users = await userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.roles', 'roles')
        .leftJoinAndSelect('roles.team', 'team')
        .leftJoinAndSelect('user.logins', 'logins')
        .where('team.id = :team_id', { team_id })
        .getMany();

    return users;
}

export { checkIfUserIsOnTeam, getAllUsersFromTeamWithDevices };
