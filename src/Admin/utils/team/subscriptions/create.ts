import { defaultDataSource } from '@services/TypeORM';

import { getTeamById } from '@utils/Team/Find';

import TeamSubscription from '@models/TeamSubscription';

interface Props {
	team_id: string;
	expireIn: Date;
	membersLimit: number;
}

async function createTeamSubscription({
	team_id,
	expireIn,
	membersLimit,
}: Props): Promise<TeamSubscription> {
	const team = await getTeamById(team_id);

	const repository = defaultDataSource.getRepository(TeamSubscription);

	const prevSubs = await repository
		.createQueryBuilder('sub')
		.leftJoinAndSelect('sub.team', 'team')
		.select(['team.id', 'sub.id'])
		.where('team.id = :team_id', { team_id })
		.getMany();

	// Delete all previous subscriptions
	await repository.remove(prevSubs);

	const teamSubscription = new TeamSubscription();
	teamSubscription.expireIn = expireIn;
	teamSubscription.membersLimit = membersLimit;
	teamSubscription.team = team;

	const createdSubscription = await repository.save(teamSubscription);

	return createdSubscription;
}

export { createTeamSubscription };
