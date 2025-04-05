import { Request, Response, NextFunction } from 'express';

import { getUserByFirebaseId } from '@utils/User/Find';
import { getUserDevice } from '@utils/User/Devices/GetUserDevice';

import AppError from '@errors/AppError';

async function deviceChecker(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	if (process.env.DEV_MODE === 'true') {
		return next();
	}
	const device_id = req.headers.deviceid;

	if (!device_id) {
		throw new AppError({
			message: 'Provide the device id',
			statusCode: 401,
		});
	}

	if (!req.userId) {
		throw new AppError({ message: 'Provide the user id', statusCode: 401 });
	}

	const user = await getUserByFirebaseId(req.userId);
	const userLogin = await getUserDevice(user.id);

	if (!userLogin || userLogin.device_id !== device_id) {
		throw new AppError({
			message: 'Device is not allowed, please make login again',
			statusCode: 403,
			internalErrorCode: 22,
		});
	}

	return next();
}

export default deviceChecker;
