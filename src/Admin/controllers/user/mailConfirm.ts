import { Request, Response } from 'express';
import * as Yup from 'yup';

import { confirmUserMail } from '@admin/utils/user/confirmMail';

import AppError from '@errors/AppError';

class UserMailConfirmation {
	async update(req: Request, res: Response): Promise<Response> {
		const schema = Yup.object().shape({
			email: Yup.string().required().email(),
		});

		try {
			await schema.validate(req.params);
		} catch (error) {
			if (error instanceof Error) {
				throw new AppError({
					message: error.message,
				});
			}
		}

		await confirmUserMail(req.params.email);

		return res.send('Mail Confirmed');
	}
}

export default new UserMailConfirmation();
