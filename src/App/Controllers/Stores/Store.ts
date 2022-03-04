import { Request, Response } from 'express';

import { getAllStoresFromTeam } from '@utils/Stores/List';
import { createStore } from '@utils/Stores/Create';
import { getUserByFirebaseId } from '@utils/User';

import AppError from '@errors/AppError';

// Parent route (team) has a middleware to check if user is on team
// so it is not necessary to check it here
class StoreControle {
    async index(req: Request, res: Response): Promise<Response> {
        const { team_id } = req.params;

        const stores = await getAllStoresFromTeam({ team_id });

        return res.json(stores);
    }

    async create(req: Request, res: Response): Promise<Response> {
        const { team_id } = req.params;
        const { name } = req.body;

        if (!req.userId) {
            throw new AppError({
                message: 'Provider your id',
                internalErrorCode: 1,
            });
        }

        const user = await getUserByFirebaseId(req.userId);

        const allStoresInTeam = await getAllStoresFromTeam({ team_id });
        const alreadyExists = allStoresInTeam.find(
            store => store.name.toLowerCase() === name.toLowerCase(),
        );

        if (alreadyExists) {
            throw new AppError({
                message: 'There are already a store with the same name',
                internalErrorCode: 36,
            });
        }

        const createdStore = await createStore({
            name,
            team_id,
            admin_id: user.id,
        });

        return res.status(201).json(createdStore);
    }
}

export default new StoreControle();
