import { Request, Response, NextFunction } from 'express';

import { getUserByEmail } from '@utils/User/Find';

async function handleSetUserId(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	if (req.userEmail) {
		const user = await getUserByEmail(req.userEmail);

		req.userUUID = user.id;

		return next();
	}

	return next();
}

export default handleSetUserId;
