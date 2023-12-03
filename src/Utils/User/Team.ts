import { getRepository } from 'typeorm';

import UserTeam from '@models/UserTeam';

async function getTeamFromUser(user_id: string): Promise<UserTeam | null> {
    const roleRepository = getRepository(UserTeam);

    const role = await roleRepository
        .createQueryBuilder('role')
        .leftJoinAndSelect('role.user', 'user')
        .leftJoinAndSelect('role.team', 'team')
        .select([
            'user.id',
            'team.id',
            'team.name',
            'role.role',
            'role.status',
            'role.code',
        ])
        .where('user.id = :user_id', { user_id })
        .getOne();

    return role || null;
}

export { getTeamFromUser };
