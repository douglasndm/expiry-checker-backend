import { firestore } from 'firebase-admin';

import { getUserById } from '../Find';

import AppError from '@errors/AppError';

async function getUserDevice(user_id: string): Promise<IUserDevice> {
	const user = await getUserById(user_id);

	const usersCollection = firestore().collection('users');
	const firestoreUser = await usersCollection.doc(user.email).get();

	const data = firestoreUser.data();

	if (!firestoreUser.exists || !data) {
		throw new AppError({
			message: 'User not found',
			internalErrorCode: 7,
		});
	}

	if (!data.device) {
		throw new AppError({
			message: 'Device is not allowed, please make login again',
			internalErrorCode: 22,
		});
	}

	return data.device as IUserDevice;
}

export { getUserDevice };
