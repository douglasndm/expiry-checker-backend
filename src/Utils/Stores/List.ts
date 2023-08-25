import { getRepository } from 'typeorm';

import Cache from '@services/Cache';

import Store from '@models/Store';

interface getAllStoresFromTeamProps {
    team_id: string;
}
async function getAllStoresFromTeam({
    team_id,
}: getAllStoresFromTeamProps): Promise<Store[]> {
    const cache = new Cache();
    const cached = await cache.get<Store[]>(`team_stores:${team_id}`);

    if (cached) {
        return cached;
    }

    const storeRepository = getRepository(Store);

    const stores = await storeRepository
        .createQueryBuilder('stores')
        .leftJoinAndSelect('stores.team', 'team')
        .where('team.id = :team_id', { team_id })
        .select(['stores.id', 'stores.name'])
        .getMany();

    await cache.save(`team_stores:${team_id}`, stores);

    return stores;
}

export { getAllStoresFromTeam };
