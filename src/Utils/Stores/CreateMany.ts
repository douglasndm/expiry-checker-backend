import { getRepository } from 'typeorm';

import Cache from '@services/Cache';

import Store from '@models/Store';

import { getAllStoresFromTeam } from '@utils/Stores/List';
import { getTeamById } from '@utils/Team/Find';

interface createManyStoresProps {
    stores_names: Array<string>;
    team_id: string;
}

async function createManyStores(
    props: createManyStoresProps,
): Promise<Store[]> {
    const { stores_names, team_id } = props;

    const storesFromTeam = await getAllStoresFromTeam({ team_id });
    const storesToCreate = stores_names.filter(sto => {
        const exists = storesFromTeam.find(
            b => b.name.toLowerCase() === sto.toLowerCase(),
        );

        if (exists) {
            return false;
        }

        return true;
    });

    const team = await getTeamById(team_id);

    const stores = storesToCreate.map(sName => {
        const store = new Store();
        store.name = sName;
        store.team = team;

        return store;
    });

    const repository = getRepository(Store);
    const createdStores = await repository.save(stores);

    const cache = new Cache();
    await cache.invalidade(`team_stores:${team_id}`);

    return createdStores;
}

export { createManyStores };
