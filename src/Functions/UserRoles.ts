import { getRepository } from 'typeorm';

import UserRoles from '@models/UserRoles';

export async function getAllRoles(): Promise<Array<UserRoles>> {
    const userRolesRepositoy = getRepository(UserRoles);

    const roles = await userRolesRepositoy
        .createQueryBuilder('userRoles')
        .leftJoinAndSelect('userRoles.team', 'team')
        .leftJoinAndSelect('userRoles.user', 'user')
        .getMany();

    return roles;
}
