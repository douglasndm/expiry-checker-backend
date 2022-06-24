import { getRepository } from 'typeorm';

import Cache from '@services/Cache';

import UserRoles from '@models/UserRoles';

import AppError from '@errors/AppError';

import { getUserRole } from './Find';

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

    const findedRole = await getUserRole({ user_id, team_id });

    findedRole.role = fixedRole;

    const updatedRole = await roleRepository.save(findedRole);

    const cache = new Cache();
    await cache.invalidade(`users-from-teams:${team_id}`);

    return updatedRole;
}

interface removeUserProps {
    user_id: string;
    team_id: string;
}

async function removeUser({
    user_id,
    team_id,
}: removeUserProps): Promise<void> {
    const roleRepository = getRepository(UserRoles);
    const role = await getUserRole({ user_id, team_id });

    if (role.role.toLowerCase() === 'manager') {
        throw new AppError({
            message: 'You cannot remove a manager from team',
            internalErrorCode: 41,
            statusCode: 401,
        });
    }

    await roleRepository.remove(role);

    const cache = new Cache();
    await cache.invalidade(`users-from-teams:${team_id}`);
}
export { updateRole, removeUser };
