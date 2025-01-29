import { Request, Response } from 'express';

import { getUserByFirebaseId } from '@utils/User/Find';
import { createUser } from '@utils/User/Create';
import { createSession } from '@utils/User/Session';

import AppError from '@errors/AppError';

class SessionController {
	async store(req: Request, res: Response): Promise<Response> {
		if (!req.userId || !req.userEmail) {
			throw new AppError({
				message: 'Provide the user id and email',
				statusCode: 401,
				internalErrorCode: 2,
			});
		}

		try {
			await getUserByFirebaseId(req.userId);
		} catch (err) {
			if (err instanceof AppError) {
				if (err.errorCode === 7) {
					await createUser({
						firebaseUid: req.userId,
						email: req.userEmail,
					});
				}
			}
		}

		if (!req.headers.deviceid) {
			throw new AppError({
				message: 'Provide the device id',
				statusCode: 401,
				internalErrorCode: 2,
			});
		}

		if (req.headers.authorization) {
			const device_id = req.headers.deviceid;

			const { firebaseToken } = req.body;

			const response = await createSession({
				firebaseUid: req.userId,
				firebaseToken,
				device_id: String(device_id),
			});

			return res.status(201).json(response);
		}

		throw new AppError({
			message: 'Unauthorized',
			statusCode: 403,
			internalErrorCode: 3,
		});
	}
}

export default new SessionController();
