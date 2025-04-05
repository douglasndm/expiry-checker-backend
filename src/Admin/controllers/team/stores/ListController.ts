import { Request, Response } from 'express';

import {
	getAllStoresFromTeam,
	getStoresFromTeamOnFirestore,
} from '@utils/Stores/List';

class StoreListController {
	async index(req: Request, res: Response): Promise<Response> {
		const { team_id } = req.params;

		const stores = await getAllStoresFromTeam({ team_id });
		const firestoreStores = await getStoresFromTeamOnFirestore(team_id);

		return res.json({
			storesOnPostgres: stores,
			storesOnFirestore: firestoreStores,
		});
	}
}

export default new StoreListController();
