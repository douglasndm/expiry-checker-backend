import { getRepository } from 'typeorm';

import Brand from '@models/Brand';

import Cache from '@services/Cache';

async function deleteAllBrandsFromTeam(team_id: string): Promise<void> {
    const repository = getRepository(Brand);

    const brands = await repository
        .createQueryBuilder('brand')
        .leftJoinAndSelect('brand.team', 'team')
        .where('team.id = :team_id', { team_id })
        .getMany();

    await repository.remove(brands);

    const cache = new Cache();
    await cache.invalidadeTeamCache(team_id);
}

export { deleteAllBrandsFromTeam };
