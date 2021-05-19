import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import UserRoles from '../App/Models/UserRoles';

interface getAllUsersByTeamProps {
    team_id: string;
}

interface UserResponse {
    id: string;
    name: string;
    email: string;
    role: string;
}

export async function getAllUsersByTeam({
    team_id,
}: getAllUsersByTeamProps): Promise<Array<UserResponse>> {
    const schema = Yup.object().shape({
        team_id: Yup.string().required().uuid(),
    });

    if (!(await schema.isValid({ team_id }))) {
        throw new Error('Team ID is not valid');
    }

    const userTeamsRepository = getRepository(UserRoles);
    const userTeams = await userTeamsRepository.find({
        where: {
            team: { id: team_id },
        },
        relations: ['user'],
    });

    const users: Array<UserResponse> = userTeams.map(u => ({
        id: u.user.firebaseUid,
        name: u.user.name,
        email: u.user.email,
        role: u.role,
        status: u.status,
    }));

    return users;
}
