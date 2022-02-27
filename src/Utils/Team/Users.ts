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
        includeDevices: false,
    });

    const isOnTeam = usersOnTeam.find(user => user.id === user_id);

    if (isOnTeam) return true;
    return false;
}

export { checkIfUserIsOnTeam };
