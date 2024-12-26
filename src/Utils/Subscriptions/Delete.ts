import { defaultDataSource } from '@services/TypeORM';

import TeamSubscription from '@models/TeamSubscription';

async function deleteSubscription(team_id: string): Promise<void> {
    const subscriptionRepository =
        defaultDataSource.getRepository(TeamSubscription);

    const subscription = await subscriptionRepository
        .createQueryBuilder('sub')
        .leftJoinAndSelect('sub.team', 'team')
        .where('team.id = :team_id', { team_id })
        .getMany();

    await subscriptionRepository.remove(subscription);
}

export { deleteSubscription };
