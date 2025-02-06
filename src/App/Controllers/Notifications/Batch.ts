import { Request, Response } from 'express';
import * as Yup from 'yup';

import BackgroundJob from '@services/Queue';

import { getUserByFirebaseId } from '@utils/User/Find';

import AppError from '@errors/AppError';

class BatchNotificationController {
	async store(req: Request, res: Response): Promise<Response> {
		const schema = Yup.object().shape({
			batch_id: Yup.string().required().uuid(),
		});

		try {
			await schema.validate(req.params);
		} catch (err) {
			if (err instanceof Error)
				throw new AppError({
					message: err.message,
					statusCode: 400,
					internalErrorCode: 1,
				});
		}

		if (!req.userId) {
			throw new AppError({
				message: 'Provide the user id',
				statusCode: 401,
				internalErrorCode: 2,
			});
		}

		const { batch_id } = req.params;

		const user = await getUserByFirebaseId(req.userId);

		await BackgroundJob.add('SendBatchNotification', {
			batch_id,
			user_id: user.id,
		});

		return res.status(201).send();
	}
}

export default new BatchNotificationController();
