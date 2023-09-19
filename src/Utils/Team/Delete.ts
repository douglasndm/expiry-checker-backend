import { getRepository } from 'typeorm';

import Team from '@models/Team';

import { deleteAllProductsFromTeam } from '@utils/Product/Delete';
import { deleteAllBrandsFromTeam } from '@utils/Brands/Delete';
import { deleteAllLogsFromTeam } from '@utils/Team/Management/Logs/Delete';

import Cache from '@services/Cache';

import { getTeamById } from './Find';

async function deleteTeam(team_id: string): Promise<void> {
    const teamRepository = getRepository(Team);

    const team = await getTeamById(team_id);
    // this is for fix "error: update or delete on table "brands" violates foreign key constraint"
    await deleteAllProductsFromTeam(team_id);
    await deleteAllBrandsFromTeam(team_id);
    await deleteAllLogsFromTeam(team_id);

    await teamRepository.remove(team);

    const cache = new Cache();
    await cache.invalidadeTeamCache(team_id);
}

export { deleteTeam };
