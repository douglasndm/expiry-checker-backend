import { Request, Response } from 'express';

import { getTeamFromUser } from '@utils/User/Team';

class UserTeamController {
    async index(req: Request, res: Response): Promise<Response> {
        if (!req.userUUID) {
            return res
                .status(401)
                .json({ message: 'User UUID was not provided' });
        }

        const userRole = await getTeamFromUser(req.userUUID);

        const response = {
            ...userRole,
            role: userRole?.role.toLowerCase(),
        };

        delete response?.user;

        return res.json(response);
    }
}

export default new UserTeamController();
