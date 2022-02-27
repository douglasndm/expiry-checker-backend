import { Request, Response } from 'express';

import { getAllStoresFromTeam } from '@utils/Stores/List';

class StoreControle {
    async index(req: Request, res: Response): Promise<Response> {
        const { team_id } = req.params;

        const stores = await getAllStoresFromTeam({ team_id });

        return res.json(stores);
    }
}

export default new StoreControle();
