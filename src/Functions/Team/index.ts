import { getRepository } from 'typeorm';
import { isBefore } from 'date-fns';

import TeamSubscription from '../../App/Models/TeamSubscription';

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
