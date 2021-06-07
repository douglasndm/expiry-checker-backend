import { getRepository } from 'typeorm';
import { isBefore, compareAsc, startOfDay } from 'date-fns';

import { Team } from '../../App/Models/Team';

import { getAllUsersByTeam } from '../Teams';
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

    if (isBefore(new Date(), sub.expireIn)) {
        const users = await getAllUsersByTeam({ team_id });

        return {
            limit: sub.membersLimit,
            members: users.length,
        };
    }

    throw new Error('Subscription is expired');
}
