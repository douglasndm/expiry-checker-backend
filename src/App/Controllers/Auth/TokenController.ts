import { Request, Response } from 'express';
import { auth } from 'firebase-admin';

import { getUserByFirebaseId } from '@utils/User/Find';

import AppError from '@errors/AppError';

class TokenController {
	async store(req: Request, res: Response): Promise<Response> {
		if (!req.userId) {
			throw new AppError({
				message: 'Provide the user id',
			});
		}

		const user = await getUserByFirebaseId(req.userId);

		const additionalClaims = { userId: user.id };

		const token = await auth().createCustomToken(
			req.userId,
			additionalClaims
		);
		return res.send({ token });
	}
}

export default new TokenController();
