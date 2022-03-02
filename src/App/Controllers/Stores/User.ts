import { Request, Response } from 'express';

import {
    addUserToStore,
    getAllUsersFromStore,
    removeUserFromStore,
} from '@utils/Stores/Users';
import { removeUserFromAllStoresFromTeam } from '@utils/Stores/Team';

class StoreUsers {
    async index(req: Request, res: Response): Promise<Response> {
        const { store_id } = req.params;

        const users = await getAllUsersFromStore({ store_id });

        return res.json(users);
    }

    async store(req: Request, res: Response): Promise<Response> {
        const { store_id } = req.params;
        const { user_id } = req.body;

        await addUserToStore({ user_id, store_id });

        return res.status(201).send();
    }

    async delete(req: Request, res: Response): Promise<Response> {
        const { store_id } = req.params;
        const { user_id } = req.body;

        await removeUserFromStore({ user_id, store_id });

        return res.send();
    }

    async deleteAll(req: Request, res: Response): Promise<Response> {
        const { team_id } = req.params;
        const { user_id } = req.body;

        await removeUserFromAllStoresFromTeam({ user_id, team_id });

        return res.send();
    }
}

export default new StoreUsers();
