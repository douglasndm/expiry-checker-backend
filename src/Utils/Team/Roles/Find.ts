import { getRepository } from 'typeorm';

import UserTeam from '@models/UserTeam';

import AppError from '@errors/AppError';

interface getUserRoleProps {
    user_id: string;
    team_id: string;
}

async function getUserRole({
    user_id,
    team_id,
}: getUserRoleProps): Promise<UserTeam> {
    const roleRepository = getRepository(UserTeam);

    const findedRole = await roleRepository
        .createQueryBuilder('role')
        .leftJoinAndSelect('role.user', 'user')
        .leftJoinAndSelect('role.team', 'team')
        .where('team.id = :team_id', { team_id })
        .andWhere('user.id = :user_id', { user_id })
        .getOne();

    if (!findedRole) {
        throw new AppError({
            message: 'User does not have a role in team',
            internalErrorCode: 17,
        });
    }

    return findedRole;
}

export { getUserRole };
