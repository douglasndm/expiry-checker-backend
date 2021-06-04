import { getRepository } from 'typeorm';
import { isBefore, compareAsc, startOfDay } from 'date-fns';

import { Team } from '../../App/Models/Team';

import { getAllUsersByTeam } from '../Teams';
import {
    checkSubscriptionOnRevenueCat,
    checkSubscriptions,
    getAllSubscriptionsFromTeam,
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

    const subscriptions = await getAllSubscriptionsFromTeam({ team_id });

    const activeSubs = subscriptions.filter(sub => {
        const date = startOfDay(sub.expireIn);

        if (compareAsc(today, date) <= 0) {
            return true;
        }

        return false;
    });

    if (activeSubs.length > 0) return true;
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
    const subs = await getAllSubscriptionsFromTeam({ team_id });

    const activeSubs = subs.filter(sub => isBefore(new Date(), sub.expireIn));

    let limit = 0;

    activeSubs.forEach(sub => {
        limit += sub.membersLimit;
    });

    const users = await getAllUsersByTeam({ team_id });

    return {
        limit,
        members: users.length,
    };
}
