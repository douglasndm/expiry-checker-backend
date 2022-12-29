import { Request, Response } from 'express';

import { removeUserFromTeam } from '@utils/Team/Roles/Remove';

import AppError from '@errors/AppError';

class UserController {
    async delete(req: Request, res: Response): Promise<Response> {
        const user_id = req.userUUID;
        const { team_id } = req.params;

        if (!user_id) {
            throw new AppError({
                message: 'Provider an user id',
            });
        }

        await removeUserFromTeam({ user_id, team_id });

        return res.send();
    }
}

export default new UserController();
