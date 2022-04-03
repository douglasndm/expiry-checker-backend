import { getRepository } from 'typeorm';

import Cache from '@services/Cache';

import UserRoles from '@models/UserRoles';

import AppError from '@errors/AppError';

interface updateRoleProps {
    role: string;
    user_id: string;
    team_id: string;
}

async function updateRole({
    role,
    user_id,
    team_id,
}: updateRoleProps): Promise<UserRoles> {
    const fixedRole = role.toLowerCase().trim();

    if (
        fixedRole !== 'manager' &&
        fixedRole !== 'supervisor' &&
        fixedRole !== 'repositor'
    ) {
        throw new AppError({
            message: 'Invalid role',
            internalErrorCode: 21,
        });
    }

    const roleRepository = getRepository(UserRoles);

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

    findedRole.role = fixedRole;

    const updatedRole = await roleRepository.save(findedRole);

    const cache = new Cache();
    await cache.invalidade(`users-from-teams:${team_id}`);

    return updatedRole;
}

export { updateRole };
