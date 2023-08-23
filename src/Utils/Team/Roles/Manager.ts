import { getUserRole } from './Find';

interface isManagerProps {
    user_id: string;
    team_id: string;
}

async function isManager({
    user_id,
    team_id,
}: isManagerProps): Promise<boolean> {
    const role = await getUserRole({ user_id, team_id });

    if (role.role.toLowerCase() === 'manager') {
        return true;
    }

    return false;
}

export { isManager };
