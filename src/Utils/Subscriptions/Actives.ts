import { compareAsc, endOfDay } from 'date-fns';

import { defaultDataSource } from '@services/TypeORM';

import TeamSubscription from '@models/TeamSubscription';

async function getTeamsWithActiveSubscriptions(): Promise<TeamSubscription[]> {
    const subscriptionRepository =
        defaultDataSource.getRepository(TeamSubscription);

    const allSubscriptions = await subscriptionRepository
        .createQueryBuilder('sub')
        .leftJoinAndSelect('sub.team', 'team')
        .getMany();

    const activeSubs = allSubscriptions.filter(sub => {
        const today = endOfDay(new Date());
        const expDate = endOfDay(sub.expireIn);

        const expired = compareAsc(today, expDate);

        if (expired < 0) {
            return true;
        }

        return false;
    });

    return activeSubs;
}

export { getTeamsWithActiveSubscriptions };
