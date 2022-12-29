import { getRepository } from 'typeorm';

import UserRoles from '@models/UserRoles';
import AppError from '@errors/AppError';

interface removeUserFromTeamProps {
    user_id: string;
    team_id: string;
}

async function removeUserFromTeam({
    user_id,
    team_id,
}: removeUserFromTeamProps): Promise<void> {
    const repository = getRepository(UserRoles);

    const role = await repository
        .createQueryBuilder('role')
        .leftJoinAndSelect('role.user', 'user')
        .leftJoinAndSelect('role.team', 'team')
        .where('user.id = :user_id', { user_id })
        .andWhere('team.id = :team_id', { team_id })
        .getOne();

    if (!role) {
        throw new AppError({
            message: 'User is not in the team',
            internalErrorCode: 17,
        });
    }

    if (role.role.toLowerCase() === 'manager') {
        throw new AppError({
            message:
                "Manager can't be removed from team, please delete the team",
            internalErrorCode: 41,
            statusCode: 401,
        });
    }

    await repository.remove(role);
}

export { removeUserFromTeam };
