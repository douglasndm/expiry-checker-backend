import { getRepository } from 'typeorm';

import UserRoles from '@models/UserRoles';

export async function getAllUserRoles(): Promise<UserRoles[]> {
    const userRolesRepository = getRepository(UserRoles);

    const roles = await userRolesRepository
        .createQueryBuilder('roles')
        .leftJoinAndSelect('roles.team', 'team')
        .leftJoinAndSelect('roles.user', 'user')
        .getMany();

    return roles;
}
