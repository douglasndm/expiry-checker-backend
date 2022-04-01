import { getRepository } from 'typeorm';

import TeamSubscription from '@models/TeamSubscription';

async function deleteSubscription(team_id: string): Promise<void> {
    const subscriptionRepository = getRepository(TeamSubscription);

    const subscription = await subscriptionRepository
        .createQueryBuilder('sub')
        .leftJoinAndSelect('sub.team', 'team')
        .where('team.id = :team_id', { team_id })
        .getMany();

    await subscriptionRepository.remove(subscription);
}

export { deleteSubscription };
