import { defaultDataSource } from '@project/ormconfig';

import TeamSubscription from '@models/TeamSubscription';

interface getTeamSubscriptionProps {
    team_id: string;
}

async function getTeamSubscription({
    team_id,
}: getTeamSubscriptionProps): Promise<TeamSubscription | null> {
    const subscriptionRepository =
        defaultDataSource.getRepository(TeamSubscription);

    const subscription = await subscriptionRepository
        .createQueryBuilder('sub')
        .leftJoinAndSelect('sub.team', 'team')
        .where('team.id = :team_id', { team_id })
        .select(['sub.id', 'sub.expireIn', 'sub.membersLimit', 'sub.isActive'])
        .orderBy('sub.expireIn', 'DESC')
        .getOne();

    return subscription || null;
}

export { getTeamSubscription };
