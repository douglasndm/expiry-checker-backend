import { Request, Response } from 'express';

import { getTeamFromUser } from '@utils/User/Team';
import AppError from '@errors/AppError';

class UserTeamController {
	async index(req: Request, res: Response): Promise<Response> {
		if (!req.userUUID) {
			return res
				.status(401)
				.json({ message: 'User UUID was not provided' });
		}

		const userRole = await getTeamFromUser(req.userUUID);

		if (!userRole) {
			throw new AppError({
				message: 'User is not in team',
			});
		}

		const response = {
			...userRole,
			role: userRole?.role.toLowerCase(),
			status: userRole.status?.toLowerCase(),
		};

		delete response?.user;

		return res.json(response);
	}
}

export default new UserTeamController();
