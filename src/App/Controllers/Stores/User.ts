import { Request, Response } from 'express';

import { addUserToStore, getAllUsersFromStore } from '@utils/Stores/Users';

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
}

export default new StoreUsers();
