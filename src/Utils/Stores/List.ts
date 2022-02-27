import { getRepository } from 'typeorm';

import Store from '@models/Store';

interface getAllStoresFromTeamProps {
    team_id: string;
}
async function getAllStoresFromTeam({
    team_id,
}: getAllStoresFromTeamProps): Promise<Store[]> {
    const storeRepository = getRepository(Store);

    const stores = await storeRepository
        .createQueryBuilder('stores')
        .leftJoinAndSelect('stores.team', 'team')
        .where('team.id = :team_id', { team_id })
        .getMany();

    return stores;
}

export { getAllStoresFromTeam };
