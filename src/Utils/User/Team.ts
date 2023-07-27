import { getRepository } from 'typeorm';

import UserRoles from '@models/UserRoles';

async function getTeamFromUser(user_id: string): Promise<UserRoles | null> {
    const roleRepository = getRepository(UserRoles);

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
