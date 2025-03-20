import { defaultDataSource } from '@services/TypeORM';

import User from '@models/User';

import AppError from '@errors/AppError';

type IResponse = Omit<IUser, 'createdAt' | 'updatedAt'>;

async function getUserByFirebaseId(firebase_id: string): Promise<IResponse> {
	const userReposity = defaultDataSource.getRepository(User);

	const user = await userReposity
		.createQueryBuilder('user')
		.where('user.firebase_uid = :firebase_id', { firebase_id })
		.getOne();

	if (!user) {
		throw new AppError({
			message: 'User not found',
			internalErrorCode: 7,
		});
	}

	return user;
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
