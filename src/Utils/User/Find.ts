import admin from 'firebase-admin';

import { defaultDataSource } from '@services/TypeORM';

import User from '@models/User';

import AppError from '@errors/AppError';

type IResponse = Omit<IUser, 'createdAt' | 'updatedAt'>;

async function getUserByFirebaseId(firebase_id: string): Promise<IUser> {
	const firestore = admin.firestore();
	const usersCollection = firestore.collection('users');

	const user = await usersCollection
		.where('firebaseUid', '==', firebase_id)
		.get();

	if (user.size === 0) {
		throw new AppError({
			message: 'User not found',
			internalErrorCode: 7,
		});
	}

	return user.docs[0].data() as IUser;
}

async function getUserById(id: string): Promise<IResponse> {
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

async function getUserByEmail(email: string): Promise<IResponse> {
	const userReposity = defaultDataSource.getRepository(User);

	const user = await userReposity
		.createQueryBuilder('user')
		.where('lower(user.email) = :email', { email: email.toLowerCase() })
		.getOne();

	if (!user) {
		throw new AppError({
			message: 'User not found',
			internalErrorCode: 7,
		});
	}

	return user;
}

export { getUserById, getUserByEmail, getUserByFirebaseId };
