import { getRepository } from 'typeorm';
import { compareAsc, startOfDay } from 'date-fns';

import { Team } from '@models/Team';

import { isUserManager } from '@utils/Users/UserRoles';
import { getAllUsersByTeam } from '../Teams';
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
        throw new Error('Team was not found');
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
        throw new Error('Team doesnt have any subscription');
    }

    if (compareAsc(startOfDay(new Date()), startOfDay(sub.expireIn)) <= 0) {
        const users = await getAllUsersByTeam({ team_id });

        return {
            limit: sub.membersLimit,
            members: users.length,
        };
    }

    throw new Error('Subscription is expired');
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
        throw new Error("You don't have permission to do that");
    }

    const teamRepository = getRepository(Team);
    const team = await teamRepository.findOne(team_id);

    if (!team) {
        throw new Error('Team was not found');
    }

    await deleteAllProducts({ team_id });

    await teamRepository.remove(team);
}
