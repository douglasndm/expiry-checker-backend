import { compareAsc, startOfDay } from 'date-fns';

import { getSubscription } from '@utils/Subscriptions/Subscription';

import AppError from '@errors/AppError';

import { getAllUsersFromTeam } from './Users';

interface checkIfTeamIsActiveProps {
    team_id: string;
}

export async function checkIfTeamIsActive({
    team_id,
}: checkIfTeamIsActiveProps): Promise<boolean> {
    try {
        await getSubscription(team_id);

        return true;
    } catch (err) {
        return false;
    }
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
    const sub = await getSubscription(team_id);

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
