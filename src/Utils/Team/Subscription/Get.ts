import { defaultDataSource } from '@services/TypeORM';

import TeamSubscription from '@models/TeamSubscription';

async function getSubscriptionFromTeam(
    team_id: string,
): Promise<TeamSubscription | null> {
    const subRepository = defaultDataSource.getRepository(TeamSubscription);

    const sub = await subRepository
        .createQueryBuilder('sub')
        .leftJoinAndSelect('sub.team', 'team')
        .select([
            'team.id',
            'sub.id',
            'sub.expireIn',
            'sub.membersLimit',
            'sub.isActive',
        ])
        .where('team.id = :team_id', { team_id })
        .getOne();

    return sub || null;
}

export { getSubscriptionFromTeam };
