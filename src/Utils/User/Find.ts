import { firestore } from 'firebase-admin';

import { defaultDataSource } from '@services/TypeORM';
import { captureException } from '@services/ExceptionsHandler';

import User from '@models/User';

import AppError from '@errors/AppError';

type IResponse = Omit<IUser, 'createdAt' | 'updatedAt'>;

async function processUser(
	userRef: firestore.Query<firestore.DocumentData, firestore.DocumentData>
): Promise<IResponse> {
	const firebaseUser = await userRef.get();

	if (firebaseUser.size === 0) {
		throw new AppError({
			message: 'User not found',
			internalErrorCode: 7,
		});
	}

	const data = firebaseUser.docs[0].data();

	const user: IResponse = {
		id: data.id,
		name: data.name || null,
		lastName: data.lastName || null,
		email: firebaseUser.docs[0].id,
		firebaseUid: data.firebaseUid,
	};

	return user;
}

async function getUserByFirebaseId(firebase_id: string): Promise<IResponse> {
	const userCollection = firestore().collection('users');
	const userRef = userCollection.where('firebaseUid', '==', firebase_id);

	return processUser(userRef);
}

async function getUserById(id: string): Promise<IResponse> {
	try {
		const userCollection = firestore().collection('users');
		const userRef = userCollection.where('id', '==', id);

		return processUser(userRef);
	} catch (error) {
		captureException(error, { userId: id });

		const userReposity = defaultDataSource.getRepository(User);

		const user = await userReposity
			.createQueryBuilder('user')
			.where('user.id = :id', { id })
			.getOne();

		if (!user) {
			throw new AppError({
				message: 'User not found',
				internalErrorCode: 7,
			});
		}

		return user;
	}
}

async function getUserByEmail(email: string): Promise<IResponse> {
	const userCollection = firestore().collection('users');
	const userRef = userCollection.doc(email);

	const response = await userRef.get();
	const data = response.data();

	if (!response.exists || !data) {
		throw new AppError({
			message: 'User not found',
			internalErrorCode: 7,
		});
	}

	const user: IResponse = {
		id: data.id,
		name: data.name,
		lastName: data.lastName,
		email: data.email,
		firebaseUid: data.firebaseUid,
	};

	return user;
}

export { getUserById, getUserByEmail, getUserByFirebaseId };
