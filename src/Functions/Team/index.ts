import { getRepository } from 'typeorm';
import { compareAsc, startOfDay } from 'date-fns';

import { Team } from '@models/Team';

import AppError from '@errors/AppError';

import { isUserManager } from '@utils/Users/UserRoles';
import { getAllUsersFromTeam } from './Users';
import { deleteAllProducts } from './Products';
import {
    checkSubscriptionOnRevenueCat,
    checkSubscriptions,
    getTeamSubscription,
} from '../Subscriptions';

interface checkIfTeamIsActiveProps {
    team_id: string;
}

export async function checkIfTeamIsActive({
    team_id,
}: checkIfTeamIsActiveProps): Promise<boolean> {
    const teamRepository = getRepository(Team);
    const team = await teamRepository.findOne(team_id);

    if (!team) {
        throw new AppError({
            message: 'Team was not found',
            statusCode: 400,
            internalErrorCode: 6,
        });
    }

    const today = startOfDay(new Date());

    if (
        !team.lastTimeChecked ||
        compareAsc(today, team.lastTimeChecked) === 1
    ) {
        console.log('Checking subscription with Revenuecat');
        const revenuecat = await checkSubscriptionOnRevenueCat(team.id);
        await checkSubscriptions({
            team_id,
            revenuecatSubscriptions: revenuecat,
        });

        team.lastTimeChecked = today;
        await teamRepository.save(team);
    }

    const subscriptions = await getTeamSubscription({ team_id });

    if (!subscriptions) {
        return false;
    }

    const date = startOfDay(subscriptions.expireIn);

    if (compareAsc(today, date) <= 0) {
        return true;
    }

    return false;
}

interface checkMembersLimitProps {
    team_id: string;
}

interface checkMembersLimitResponse {
    limit: number;
    members: number;
}

export async function checkMembersLimit({
    team_id,
}: checkMembersLimitProps): Promise<checkMembersLimitResponse> {
    const sub = await getTeamSubscription({ team_id });

    if (!sub) {
        throw new AppError({
            message: "Team doesn't have any subscription",
            statusCode: 400,
            internalErrorCode: 5,
        });
    }

    if (compareAsc(startOfDay(new Date()), startOfDay(sub.expireIn)) <= 0) {
        const users = await getAllUsersFromTeam({ team_id });

        return {
            limit: sub.membersLimit,
            members: users.length,
        };
    }

    throw new AppError({
        message: 'Subscription is expired',
        statusCode: 400,
        internalErrorCode: 5,
    });
}

interface deleteTeamProps {
    team_id: string;
    user_id: string;
}

export async function deleteTeam({
    team_id,
    user_id,
}: deleteTeamProps): Promise<void> {
    const isManager = await isUserManager({ user_id, team_id });

    if (!isManager) {
        throw new AppError({
            message: "You don't have permission to do that",
            statusCode: 401,
            internalErrorCode: 2,
        });
    }

    const teamRepository = getRepository(Team);
    const team = await teamRepository.findOne(team_id);

    if (!team) {
        throw new AppError({
            message: 'Team was not found',
            statusCode: 400,
            internalErrorCode: 6,
        });
    }

    await deleteAllProducts({ team_id });

    await teamRepository.remove(team);
}
