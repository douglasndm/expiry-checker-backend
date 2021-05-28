import { getRepository } from 'typeorm';
import { isBefore } from 'date-fns';

import TeamSubscription from '../../App/Models/TeamSubscription';

import { getAllUsersByTeam } from '../Teams';

interface getAllSubscriptionsProps {
    team_id: string;
}

export async function getAllSubscriptionsFromTeam({
    team_id,
}: getAllSubscriptionsProps): Promise<Array<TeamSubscription>> {
    const repository = getRepository(TeamSubscription);

    const response = await repository
        .createQueryBuilder('subs')
        .leftJoinAndSelect('subs.team', 'team')
        .where('team.id = :team_id', { team_id })
        .getMany();

    return response;
}

interface checkIfTeamIsActiveProps {
    team_id: string;
}

export async function checkIfTeamIsActive({
    team_id,
}: checkIfTeamIsActiveProps): Promise<boolean> {
    const subscriptions = await getAllSubscriptionsFromTeam({ team_id });

    const activeSubs = subscriptions.filter(sub =>
        isBefore(new Date(), sub.expireIn),
    );

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
