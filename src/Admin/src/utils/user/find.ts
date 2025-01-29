import { defaultDataSource } from '@services/TypeORM';

import User from '@models/User';

import AppError from '@errors/AppError';

async function getUserByFirebaseId(firebase_id: string): Promise<User> {
	const userReposity = defaultDataSource.getRepository(User);

	const user = await userReposity
		.createQueryBuilder('user')
		.where('user.firebase_uid = :firebase_id', { firebase_id })
		.select([
			'user.id',
			'user.name',
			'user.lastName',
			'user.email',
			'user.firebaseUid',
		])
		.getOne();

	if (!user) {
		throw new AppError({
			message: 'User not found',
			internalErrorCode: 7,
		});
	}

	return user;
}

async function getUserById(id: string): Promise<User> {
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

async function getUserByEmail(email: string): Promise<User> {
	const userReposity = defaultDataSource.getRepository(User);

	const user = await userReposity
		.createQueryBuilder('user')
		.where('lower(user.email) = lower(:email)', { email })
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
