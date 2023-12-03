import { getRepository } from 'typeorm';

import UserTeam from '@models/UserTeam';
import User from '@models/User';

import { getTeamFromUser } from '@utils/User/Team';

import { checkMembersLimit } from '@functions/Team';

import Cache from '@services/Cache';

import AppError from '@errors/AppError';

import { getTeamById } from '../Find';

interface addUserToTeamProps {
    user_id: string;
    team_id: string;
    bypassCode?: boolean;
}

async function addUserToTeam({
    user_id,
    team_id,
    bypassCode,
}: addUserToTeamProps): Promise<UserTeam> {
    const userRolesRepository = getRepository(UserTeam);

    const cache = new Cache();
    const cachedUsers = await cache.get<Array<UserTeam>>(
        `team_users:${team_id}`,
    );

    // Check if user is already on team
    // #region
    if (cachedUsers) {
        const alreadyInTeam = cachedUsers.find(u => u.user.id === user_id);

        if (alreadyInTeam) {
            throw new AppError({
                message: 'User is already into team',
                statusCode: 400,
                internalErrorCode: 23,
            });
        }
    } else {
        const team = await getTeamFromUser(user_id);

        if (team) {
            if (team.team.id === team_id) {
                throw new AppError({
                    message: 'User is already into team',
                    statusCode: 400,
                    internalErrorCode: 23,
                });
            }
            throw new AppError({
                message: 'User is in another team',
                internalErrorCode: 30,
            });
        }

        const alreadyInARole = await userRolesRepository
            .createQueryBuilder('userRole')
            .leftJoinAndSelect('userRole.user', 'user')
            .where('userRole.team.id = :team_id', { team_id })
            .andWhere('user.id = :user_id', { user_id })
            .getOne();

        if (alreadyInARole) {
            throw new AppError({
                message: 'User is already into team',
                statusCode: 400,
                internalErrorCode: 23,
            });
        }
    }
    // #endregion

    const userRepository = getRepository(User);

    const team = await getTeamById(team_id);

    const user = await userRepository
        .createQueryBuilder('user')
        .where('user.id = :user_id', { user_id })
        .getOne();

    if (!team || !user) {
        throw new AppError({
            message: 'User or team was not found',
            statusCode: 400,
            internalErrorCode: 18,
        });
    }

    const membersChecker = await checkMembersLimit({
        team_id,
    });

    if (membersChecker.members >= membersChecker.limit) {
        throw new AppError({
            message: 'Team has reach the limit of members',
            statusCode: 401,
            internalErrorCode: 16,
        });
    }

    const teamUser = new UserTeam();
    teamUser.user = user;
    teamUser.team = team;
    teamUser.role = 'Repositor';
    teamUser.code = Math.random().toString(36).substring(7);

    if (!bypassCode) {
        teamUser.status = 'Pending';
    } else {
        teamUser.status = 'Completed';
    }

    const savedRole = await userRolesRepository.save(teamUser);
    await cache.invalidade(`team_users:${team_id}`);

    return savedRole;
}

export { addUserToTeam };
