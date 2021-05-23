import { getRepository } from 'typeorm';

import UserRoles from '../../App/Models/UserRoles';

import { checkIfTeamIsActive } from '../Team';

interface checkIfUserHasAccessToTeamProps {
    user_id: string;
    team_id: string;
}
export async function checkIfUserHasAccessToTeam({
    user_id,
    team_id,
}: checkIfUserHasAccessToTeamProps): Promise<boolean> {
    const teamActive = await checkIfTeamIsActive({ team_id });
    if (!teamActive) {
        throw new Error("Team doesn't have an active subscription");
    }

    const userRolesRepository = getRepository(UserRoles);

    try {
        const result = await userRolesRepository.findOne({
            where: {
                user: {
                    firebaseUid: user_id,
                },
                team: {
                    id: team_id,
                },
            },
        });

        if (!result) {
            return false;
        }

        return true;
    } catch (err) {
        throw new Error(err.message);
    }
}
