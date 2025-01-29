import { defaultDataSource } from '@services/TypeORM';

import Team from '@models/Team';

async function getTeamById(team_id: string): Promise<Team | null> {
	const teamRepository = defaultDataSource.getRepository(Team);

	const team = await teamRepository
		.createQueryBuilder('team')
		.leftJoinAndSelect('team.categories', 'categories')
		.leftJoinAndSelect('team.brands', 'brands')
		.leftJoinAndSelect('team.stores', 'stores')
		.leftJoinAndSelect('team.subscriptions', 'subscriptions')
		.select([
			'team.id',
			'team.name',
			'categories.id',
			'categories.name',
			'brands.id',
			'brands.name',
			'stores.id',
			'stores.name',
			'subscriptions.id',
			'subscriptions.expireIn',
			'subscriptions.membersLimit',
		])
		.where('team.id = :team_id', { team_id })
		.getOne();

	return team || null;
}

export { getTeamById };
