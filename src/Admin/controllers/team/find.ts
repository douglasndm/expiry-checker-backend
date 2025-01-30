import { Request, Response } from 'express';
import * as Yup from 'yup';

import AppError from '@errors/AppError';

import { findTeamByName, findTeamByManagerEmail } from '@admin/utils/team/find';

class FindTeamController {
	async index(req: Request, res: Response): Promise<Response> {
		const schema = Yup.object().shape({
			name: Yup.string().required(),
		});

		try {
			await schema.validate(req.query);
		} catch (error) {
			if (error instanceof Error)
				throw new AppError({
					message: error.message,
				});
		}

		const { name } = req.query;

		const team = await findTeamByName(String(name));

		return res.json(team);
	}

	async byManager(req: Request, res: Response): Promise<Response> {
		const schema = Yup.object().shape({
			email: Yup.string().email().required(),
		});

		try {
			await schema.validate(req.query);
		} catch (error) {
			if (error instanceof Error)
				throw new AppError({
					message: error.message,
				});
		}

		const { email } = req.query;

		const team = await findTeamByManagerEmail(String(email));

		return res.json(team);
	}
}

export default new FindTeamController();
