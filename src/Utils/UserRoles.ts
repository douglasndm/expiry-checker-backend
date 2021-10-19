import { getRepository } from 'typeorm';

import UserRoles from '@models/UserRoles';

import AppError from '@errors/AppError';

export async function getAllUserRoles(): Promise<UserRoles[]> {
    const userRolesRepository = getRepository(UserRoles);

    const roles = await userRolesRepository
        .createQueryBuilder('roles')
        .leftJoinAndSelect('roles.team', 'team')
        .leftJoinAndSelect('roles.user', 'user')
        .getMany();

    return roles;
}

export async function getUserRoleInTeam({
    user_id,
    team_id,
}: getUserRoleInTeamProps): Promise<IRoles> {
    const userRolesRepository = getRepository(UserRoles);

    const roles = await userRolesRepository
        .createQueryBuilder('roles')
        .leftJoinAndSelect('roles.team', 'team')
        .leftJoinAndSelect('roles.user', 'user')
        .where('team.id = :team_id', { team_id })
        .andWhere('user.id = :user_id', { user_id })
        .getOne();

    if (!roles) {
        throw new AppError({
            message: 'User is not in team',
            internalErrorCode: 17,
        });
    }

    let response: IRoles = 'repositor';

    if (roles?.role.toLowerCase() === 'manager') {
        response = 'manager';
    } else if (roles?.role.toLowerCase() === 'supervisor') {
        response = 'supervisor';
    }

    return response;
}
