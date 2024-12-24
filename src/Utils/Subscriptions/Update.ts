import { parseISO, startOfDay } from 'date-fns';

import { defaultDataSource } from '@project/ormconfig';

import TeamSubscription from '@models/TeamSubscription';

import { getTeamById } from '@utils/Team/Find';

interface setTeamSubscriptionProps {
    team_id: string;
    subscription: RevenueCatSubscription;
    members: number;
}

async function setTeamSubscription({
    team_id,
    subscription,
    members,
}: setTeamSubscriptionProps): Promise<TeamSubscription> {
    const repository = defaultDataSource.getRepository(TeamSubscription);

    const subscriptions = await repository
        .createQueryBuilder('teamSubs')
        .leftJoinAndSelect('teamSubs.team', 'team')
        .where('team.id = :team_id', { team_id })
        .getMany();

    if (subscriptions.length > 0) {
        await repository.remove(subscriptions);
    }

    const team = await getTeamById(team_id);

    const teamSubscription = new TeamSubscription();
    teamSubscription.expireIn = startOfDay(parseISO(subscription.expires_date));
    teamSubscription.isActive = true;
    teamSubscription.membersLimit = members;
    teamSubscription.team = team;

    const savedSubscription = await repository.save(teamSubscription);

    return savedSubscription;
}

export { setTeamSubscription };
