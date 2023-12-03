import { getRepository } from 'typeorm';

import UserTeam from '@models/UserTeam';
import User from '@models/User';

import AppError from '@errors/AppError';

export async function getAllUserRoles(): Promise<UserTeam[]> {
    const userRolesRepository = getRepository(UserTeam);

    const roles = await userRolesRepository
        .createQueryBuilder('roles')
        .leftJoinAndSelect('roles.team', 'team')
        .leftJoinAndSelect('roles.user', 'user')
        .leftJoinAndSelect('team.stores', 'teamStores')
        .leftJoinAndSelect('user.store', 'userStores')
        .leftJoinAndSelect('userStores.store', 'store')
        .leftJoinAndSelect('store.team', 'storeTeam')
        .getMany();

    return roles;
}

export async function getUserRoleInTeam({
    user_id,
    team_id,
}: getUserRoleInTeamProps): Promise<IRoles> {
    const userRolesRepository = getRepository(UserTeam);

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

export async function getTeamAdmin(team_id: string): Promise<User> {
    const userRolesRepository = getRepository(UserTeam);

    const users = await userRolesRepository
        .createQueryBuilder('roles')
        .leftJoinAndSelect('roles.team', 'team')
        .leftJoinAndSelect('roles.user', 'user')
        .where('team.id = :team_id', { team_id })
        .getMany();

    const admin = users.find(user => user.role.toLowerCase() === 'manager');

    if (!admin) {
        throw new AppError({
            message: 'Team admin was not found',
            statusCode: 500,
        });
    }

    return admin.user;
}
