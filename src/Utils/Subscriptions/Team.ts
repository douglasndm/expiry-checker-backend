import { getRepository } from 'typeorm';

import TeamSubscription from '@models/TeamSubscription';

interface getTeamSubscriptionProps {
    team_id: string;
}

async function getTeamSubscription({
    team_id,
}: getTeamSubscriptionProps): Promise<TeamSubscription | null> {
    const subscriptionRepository = getRepository(TeamSubscription);

    const subscription = await subscriptionRepository
        .createQueryBuilder('sub')
        .leftJoinAndSelect('sub.team', 'team')
        .where('team.id = :team_id', { team_id })
        .orderBy('sub.expireIn', 'DESC')
        .getOne();

    return subscription || null;
}

export { getTeamSubscription };
