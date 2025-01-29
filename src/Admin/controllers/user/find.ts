import { Request, Response } from 'express';
import * as Yup from 'yup';

import AppError from '@errors/AppError';
import { getUserByEmail } from '@admin/utils/user/find';

class FindUserController {
	async index(req: Request, res: Response): Promise<Response> {
		const schema = Yup.object().shape({
			email: Yup.string().required().email(),
		});

		try {
			await schema.validate(req.query);
		} catch (error) {
			if (error instanceof Error) {
				throw new AppError({
					message: error.message,
				});
			}
		}

		const { email } = req.query;

		const user = await getUserByEmail(String(email));

		return res.json(user);
	}
}

export default new FindUserController();
