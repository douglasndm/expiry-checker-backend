import { Request, Response } from 'express';
import * as Yup from 'yup';

import AppError from '@errors/AppError';

import { getTeamById } from '@admin/utils/team/get';

class GetTeamController {
	async index(req: Request, res: Response): Promise<Response> {
		const schema = Yup.object().shape({
			team_id: Yup.string().uuid().required(),
		});

		try {
			await schema.validate(req.params);
		} catch (error) {
			if (error instanceof Error)
				throw new AppError({
					message: error.message,
				});
		}

		const { team_id } = req.params;

		const team = await getTeamById(team_id);

		return res.json(team);
	}
}

export default new GetTeamController();
